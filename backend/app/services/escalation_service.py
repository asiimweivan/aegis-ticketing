"""
Automatic SLA breach escalation.

Runs periodically (see main.py's lifespan scheduler). Finds tickets whose
due_date has passed without resolution and have not already been escalated,
marks them, logs an audit entry, notifies every admin in-app, and emails
every admin a summary. Designed to be safe to call repeatedly - already
escalated tickets are skipped, so nothing is double-notified.
"""
from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.models.models import Ticket, User, UserRole, TicketStatus
from app.services.email_service import send_otp_email

ACTIVE_STATUSES = [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.PENDING]


def _create_notification(db, user_id, notif_type, title, message, ticket_id=None):
    from app.models.models import Notification
    notif = Notification(type=notif_type, title=title, message=message, user_id=user_id, ticket_id=ticket_id)
    db.add(notif)


def _log_audit(db, ticket_id, user_id, action, description):
    from app.models.models import AuditLog
    log = AuditLog(action=action, description=description, ticket_id=ticket_id, user_id=user_id)
    db.add(log)


def _send_escalation_email(admin_email, admin_name, breached_tickets):
    """Reuses the existing Resend-based email sender with a custom escalation body."""
    rows_html = "".join(
        "<tr>"
        "<td style='padding:8px 12px;border-bottom:1px solid #F1F5F9;font-family:monospace;font-size:12px;color:#64748B;'>" + t.ticket_number + "</td>"
        "<td style='padding:8px 12px;border-bottom:1px solid #F1F5F9;font-size:13px;color:#0F172A;'>" + t.title + "</td>"
        "<td style='padding:8px 12px;border-bottom:1px solid #F1F5F9;font-size:12px;color:#E8450A;font-weight:700;text-transform:capitalize;'>" + t.priority.value + "</td>"
        "</tr>"
        for t in breached_tickets
    )
    html_body = (
        "<div style=\"font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#F8FAFC;padding:32px;border-radius:16px;\">"
        "<div style='text-align:center;margin-bottom:24px;'>"
        "<div style='display:inline-block;width:44px;height:44px;background:#DC2626;border-radius:10px;line-height:44px;color:#fff;font-weight:800;font-size:14px;'>!</div>"
        "<div style='margin-top:8px;font-weight:800;font-size:16px;color:#0F172A;'>AEGIS - SLA Escalation</div>"
        "</div>"
        "<div style='background:#FFFFFF;border:1px solid #FEE2E2;border-radius:14px;padding:24px;'>"
        "<p style='color:#0F172A;font-size:15px;margin:0 0 12px;'>Hi " + admin_name + ",</p>"
        "<p style='color:#64748B;font-size:14px;line-height:1.6;margin:0 0 20px;'>"
        + str(len(breached_tickets)) + " ticket(s) have breached their SLA deadline without resolution and require immediate attention.</p>"
        "<table style='width:100%;border-collapse:collapse;margin-bottom:16px;'>"
        "<tr><th style='text-align:left;padding:8px 12px;font-size:11px;color:#94A3B8;text-transform:uppercase;'>Ticket</th>"
        "<th style='text-align:left;padding:8px 12px;font-size:11px;color:#94A3B8;text-transform:uppercase;'>Title</th>"
        "<th style='text-align:left;padding:8px 12px;font-size:11px;color:#94A3B8;text-transform:uppercase;'>Priority</th></tr>"
        + rows_html +
        "</table>"
        "<p style='color:#94A3B8;font-size:12px;line-height:1.6;margin:0;'>Sign in to AEGIS to review and reassign these tickets.</p>"
        "</div>"
        "</div>"
    )
    from app.core.config import settings
    import httpx
    payload = {
        "from": settings.EMAILS_FROM_NAME + " <" + settings.EMAILS_FROM_EMAIL + ">",
        "to": [admin_email],
        "subject": "AEGIS - " + str(len(breached_tickets)) + " ticket(s) breached SLA",
        "html": html_body,
    }
    headers = {"Authorization": "Bearer " + settings.RESEND_API_KEY, "Content-Type": "application/json"}
    try:
        httpx.post("https://api.resend.com/emails", json=payload, headers=headers, timeout=15)
    except Exception as e:
        print("WARNING: escalation email failed: " + str(e))


def run_sla_escalation_check():
    """Call this on a schedule (see main.py) or manually via the admin trigger endpoint."""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        overdue = db.query(Ticket).filter(
            Ticket.due_date.isnot(None),
            Ticket.due_date < now,
            Ticket.status.in_(ACTIVE_STATUSES),
            Ticket.escalated == False,
        ).all()

        if not overdue:
            return {"escalated_count": 0, "tickets": []}

        admins = db.query(User).filter(User.role == UserRole.ADMIN, User.is_active == True).all()
        system_actor_id = admins[0].id if admins else None

        for ticket in overdue:
            ticket.escalated = True
            if system_actor_id:
                _log_audit(
                    db, ticket.id, system_actor_id, "sla_breach_escalated",
                    "Ticket " + ticket.ticket_number + " automatically escalated after breaching its SLA deadline (system-triggered)"
                )
            for admin in admins:
                _create_notification(
                    db, admin.id, "ticket_escalated",
                    "SLA Breached",
                    "Ticket " + ticket.ticket_number + " (\"" + ticket.title + "\") has breached its SLA deadline and needs attention.",
                    ticket_id=ticket.id,
                )

        db.commit()

        for admin in admins:
            _send_escalation_email(admin.email, admin.full_name, overdue)

        return {"escalated_count": len(overdue), "tickets": [t.ticket_number for t in overdue]}
    finally:
        db.close()


