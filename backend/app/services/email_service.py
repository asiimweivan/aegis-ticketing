import os
import httpx
from app.core.config import settings

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_API_URL = "https://api.resend.com/emails"


def send_otp_email(to_email: str, otp_code: str, recipient_name: str = ""):
    """Send a password reset / MFA OTP code via the Resend HTTP API.
    Returns (success: bool, error_detail: str or None)."""

    if not RESEND_API_KEY:
        return False, "RESEND_API_KEY is not configured"

    greeting = f"Hi {recipient_name}," if recipient_name else "Hi,"

    html_body = f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#F8FAFC;padding:32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;width:44px;height:44px;background:#E8450A;border-radius:10px;line-height:44px;color:#fff;font-weight:800;font-size:14px;">AE</div>
        <div style="margin-top:8px;font-weight:800;font-size:16px;color:#0F172A;">AEGIS</div>
        <div style="font-size:11px;color:#94A3B8;">Adaptive Engineering Group</div>
      </div>
      <div style="background:#FFFFFF;border:1px solid #F1F5F9;border-radius:14px;padding:28px;">
        <p style="color:#0F172A;font-size:15px;margin:0 0 12px;">{greeting}</p>
        <p style="color:#64748B;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Use the verification code below to continue. It expires in 10 minutes.
        </p>
        <div style="text-align:center;background:#FFF5F2;border:1.5px solid #FED7C8;border-radius:12px;padding:20px;margin-bottom:20px;">
          <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#E8450A;font-family:'Courier New',monospace;">{otp_code}</div>
        </div>
        <p style="color:#94A3B8;font-size:12px;line-height:1.6;margin:0;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      <p style="text-align:center;color:#94A3B8;font-size:11px;margin-top:20px;">
        (c) 2026 Adaptive Engineering Group Ltd - Kamembe, Rwanda
      </p>
    </div>
    """

    payload = {
        "from": f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>",
        "to": [to_email],
        "subject": "AEGIS - Your Verification Code",
        "html": html_body,
    }

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = httpx.post(RESEND_API_URL, json=payload, headers=headers, timeout=15)
        if response.status_code in (200, 201):
            return True, None
        return False, f"Resend API returned {response.status_code}: {response.text}"
    except Exception as e:
        return False, f"{type(e).__name__}: {e}"
