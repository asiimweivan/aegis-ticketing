import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def send_otp_email(to_email: str, otp_code: str, recipient_name: str = ""):
    """Send a password reset OTP code via SMTP using settings from .env"""

    subject = "AEGIS — Password Reset Code"
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
          You requested to reset your AEGIS password. Use the verification code below — it expires in 10 minutes.
        </p>
        <div style="text-align:center;background:#FFF5F2;border:1.5px solid #FED7C8;border-radius:12px;padding:20px;margin-bottom:20px;">
          <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#E8450A;font-family:'Courier New',monospace;">{otp_code}</div>
        </div>
        <p style="color:#94A3B8;font-size:12px;line-height:1.6;margin:0;">
          If you didn't request this, you can safely ignore this email. Your password will not be changed.
        </p>
      </div>
      <p style="text-align:center;color:#94A3B8;font-size:11px;margin-top:20px;">
        © 2026 Adaptive Engineering Group Ltd · Kamembe, Rwanda
      </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    # Force IPv4 resolution to avoid Windows IPv6/getaddrinfo quirks with smtplib
    try:
        host_ipv4 = socket.gethostbyname(settings.SMTP_HOST)
    except Exception as resolve_err:
        print(f"⚠️  Could not resolve {settings.SMTP_HOST} to IPv4: {resolve_err}")
        host_ipv4 = settings.SMTP_HOST  # fall back to original hostname

    try:
        with smtplib.SMTP(host_ipv4, settings.SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [to_email], msg.as_string())
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"⚠️  SMTP authentication failed (check app password): {e}")
        return False
    except (socket.gaierror, socket.timeout, ConnectionRefusedError) as e:
        print(f"⚠️  Could not connect to mail server: {e}")
        return False
    except Exception as e:
        print(f"⚠️  Failed to send OTP email: {e}")
        return False