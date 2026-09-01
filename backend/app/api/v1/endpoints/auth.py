import random
import string
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import User, UserRole, PasswordResetOTP
from app.schemas.schemas import (
    UserCreate, UserLogin, UserOut, Token, MessageResponse,
    ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest,
)
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, decode_token,
    get_current_user
)
from app.services.email_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if user_in.role != UserRole.CLIENT:
        raise HTTPException(
            status_code=403,
            detail="Self-registration is only available for clients. Contact admin for staff/admin accounts."
        )

    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=UserRole.CLIENT,
        department=user_in.department,
        phone=user_in.phone,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token_data = {"sub": str(user.id), "role": user.role.value}
    return Token(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=user
    )


@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    token_data = {"sub": str(user.id), "role": user.role.value}
    return Token(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=user
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    return MessageResponse(message="Logged out successfully")


# ── Password Reset (2-step OTP verification) ──

def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Don't reveal whether the email exists — respond the same either way
        return MessageResponse(message="If that email exists, a reset code has been sent.")

    # Invalidate any previous unused codes for this email
    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == payload.email,
        PasswordResetOTP.used == False
    ).update({"used": True})

    code = _generate_otp()
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)

    otp_entry = PasswordResetOTP(email=payload.email, code=code, expires_at=expires)
    db.add(otp_entry)
    db.commit()

    sent = send_otp_email(payload.email, code, user.full_name)
    if not sent:
        raise HTTPException(status_code=500, detail="Could not send reset email. Please try again later.")

    return MessageResponse(message="If that email exists, a reset code has been sent.")


@router.post("/verify-otp", response_model=MessageResponse)
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    otp_entry = db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == payload.email,
        PasswordResetOTP.code == payload.code,
        PasswordResetOTP.used == False,
    ).order_by(PasswordResetOTP.created_at.desc()).first()

    if not otp_entry:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    if otp_entry.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This code has expired. Please request a new one.")

    return MessageResponse(message="Code verified successfully")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    otp_entry = db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == payload.email,
        PasswordResetOTP.code == payload.code,
        PasswordResetOTP.used == False,
    ).order_by(PasswordResetOTP.created_at.desc()).first()

    if not otp_entry:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    if otp_entry.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This code has expired. Please request a new one.")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(payload.new_password)
    otp_entry.used = True
    db.commit()

    return MessageResponse(message="Password reset successfully")