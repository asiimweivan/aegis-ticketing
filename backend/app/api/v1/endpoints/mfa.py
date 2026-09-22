import base64
import io
import random
import string
import pyotp
import qrcode
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import User, PasswordResetOTP
from app.schemas.schemas import (
    MFASetupOut, MFACodeRequest, MFALoginRequest, MessageResponse, Token
)
from app.core.security import (
    get_current_user, decode_token, create_access_token, create_refresh_token
)
from app.core.limiter import limiter
from app.services.email_service import send_otp_email

router = APIRouter(prefix="/auth/mfa", tags=["Multi-Factor Authentication"])

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7


def _set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=REFRESH_COOKIE_MAX_AGE_SECONDS,
        path="/api/v1/auth",
    )


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def _send_email_code(db: Session, user: User) -> bool:
    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == user.email,
        PasswordResetOTP.used == False
    ).update({"used": True})

    code = _generate_otp()
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    entry = PasswordResetOTP(email=user.email, code=code, expires_at=expires)
    db.add(entry)
    db.commit()

    return send_otp_email(user.email, code, user.full_name)


def _verify_email_code(db: Session, email: str, code: str) -> bool:
    entry = db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == email,
        PasswordResetOTP.code == code,
        PasswordResetOTP.used == False,
    ).order_by(PasswordResetOTP.created_at.desc()).first()

    if not entry:
        return False
    if entry.expires_at < datetime.now(timezone.utc):
        return False

    entry.used = True
    db.commit()
    return True


# ---------- TOTP (authenticator app) ----------

@router.post("/setup", response_model=MFASetupOut)
def setup_mfa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.mfa_enabled:
        raise HTTPException(400, "MFA is already enabled on this account")

    secret = pyotp.random_base32()
    current_user.mfa_secret = secret
    db.commit()

    totp = pyotp.TOTP(secret)
    otpauth_url = totp.provisioning_uri(name=current_user.email, issuer_name="AEGIS")

    qr = qrcode.make(otpauth_url)
    buf = io.BytesIO()
    qr.save(buf)
    qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return MFASetupOut(
        secret=secret,
        qr_code="data:image/png;base64," + qr_base64,
        otpauth_url=otpauth_url,
    )


@router.post("/verify-setup", response_model=MessageResponse)
def verify_setup(
    payload: MFACodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.mfa_secret:
        raise HTTPException(400, "MFA setup has not been started")

    totp = pyotp.TOTP(current_user.mfa_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(400, "Invalid verification code")

    current_user.mfa_enabled = True
    current_user.mfa_method = "totp"
    db.commit()
    return MessageResponse(message="Two-factor authentication (authenticator app) enabled successfully")


# ---------- Email-based ----------

@router.post("/setup-email", response_model=MessageResponse)
def setup_email_mfa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.mfa_enabled:
        raise HTTPException(400, "MFA is already enabled on this account")

    sent = _send_email_code(db, current_user)
    if not sent:
        raise HTTPException(500, "Could not send verification email. Please try again.")

    return MessageResponse(message="A verification code has been sent to your email")


@router.post("/verify-setup-email", response_model=MessageResponse)
def verify_setup_email(
    payload: MFACodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not _verify_email_code(db, current_user.email, payload.code):
        raise HTTPException(400, "Invalid or expired code")

    current_user.mfa_enabled = True
    current_user.mfa_method = "email"
    db.commit()
    return MessageResponse(message="Two-factor authentication (email) enabled successfully")


# ---------- Shared: disable ----------

@router.post("/disable", response_model=MessageResponse)
def disable_mfa(
    payload: MFACodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.mfa_enabled:
        raise HTTPException(400, "MFA is not enabled on this account")

    if current_user.mfa_method == "email":
        valid = _verify_email_code(db, current_user.email, payload.code)
    else:
        totp = pyotp.TOTP(current_user.mfa_secret)
        valid = totp.verify(payload.code, valid_window=1)

    if not valid:
        raise HTTPException(400, "Invalid verification code")

    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    current_user.mfa_method = None
    db.commit()
    return MessageResponse(message="Two-factor authentication disabled successfully")


@router.post("/request-disable-email-code", response_model=MessageResponse)
def request_disable_email_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.mfa_enabled or current_user.mfa_method != "email":
        raise HTTPException(400, "Email-based MFA is not active on this account")

    sent = _send_email_code(db, current_user)
    if not sent:
        raise HTTPException(500, "Could not send verification email")
    return MessageResponse(message="A verification code has been sent to your email")


# ---------- Login-time verification ----------

@router.post("/resend", response_model=MessageResponse)
@limiter.limit("5/minute")
def resend_login_code(request: Request, payload: dict, db: Session = Depends(get_db)):
    mfa_token = payload.get("mfa_token")
    if not mfa_token:
        raise HTTPException(400, "Missing MFA session token")

    token_payload = decode_token(mfa_token)
    if token_payload.get("type") != "mfa_pending":
        raise HTTPException(401, "Invalid or expired MFA session")

    user_id = token_payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user or user.mfa_method != "email":
        raise HTTPException(400, "Email code resend is not available for this account")

    sent = _send_email_code(db, user)
    if not sent:
        raise HTTPException(500, "Could not resend verification email")
    return MessageResponse(message="A new code has been sent to your email")


@router.post("/verify-login", response_model=Token)
@limiter.limit("10/minute")
def verify_login(request: Request, response: Response, payload: MFALoginRequest, db: Session = Depends(get_db)):
    token_payload = decode_token(payload.mfa_token)
    if token_payload.get("type") != "mfa_pending":
        raise HTTPException(401, "Invalid or expired MFA session")

    user_id = token_payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user or not user.mfa_enabled:
        raise HTTPException(401, "MFA is not active for this account")

    if user.mfa_method == "email":
        valid = _verify_email_code(db, user.email, payload.code)
    else:
        totp = pyotp.TOTP(user.mfa_secret)
        valid = totp.verify(payload.code, valid_window=1)

    if not valid:
        raise HTTPException(400, "Invalid verification code")

    token_data = {"sub": str(user.id), "role": user.role.value}
    refresh = create_refresh_token(token_data)
    _set_refresh_cookie(response, refresh)

    return Token(
        access_token=create_access_token(token_data),
        user=user
    )
