from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_

from app.db.session import get_db
from app.models.models import (
    Ticket, User, Comment, AuditLog, Notification,
    UserRole, TicketStatus, TicketPriority, TicketCategory, NotificationType
)
from app.schemas.schemas import (
    TicketCreate, TicketUpdate, TicketOut, TicketListOut,
    CommentCreate, CommentOut, AuditLogOut, MessageResponse,
    EscalateTicketRequest, EscalationOut
)
from app.core.security import get_current_user, require_roles
from app.ml.classifier import classifier

router = APIRouter(prefix="/tickets", tags=["Tickets"])


def generate_ticket_number(db: Session) -> str:
    count = db.query(func.count(Ticket.id)).scalar()
    return f"TKT-{datetime.now().year}-{str(count + 1).zfill(5)}"


def create_notification(db, user_id, notif_type, title, message, ticket_id=None):
    notif = Notification(
        type=notif_type, title=title, message=message,
        user_id=user_id, ticket_id=ticket_id
    )
    db.add(notif)


def log_audit(db, ticket_id, user_id, action, description, field_changed=None, old_value=None, new_value=None):
    log = AuditLog(
        action=action, description=description, field_changed=field_changed,
        old_value=old_value, new_value=new_value, ticket_id=ticket_id, user_id=user_id
    )
    db.add(log)


@router.post("/", response_model=TicketOut, status_code=201)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ai_result = classifier.classify(ticket_in.title, ticket_in.description)
    category = ticket_in.category or ai_result["category"]
    priority = ticket_in.priority or ai_result["priority"]

    ticket = Ticket(
        ticket_number=generate_ticket_number(db),
        title=ticket_in.title,
        description=ticket_in.description,
        category=category,
        priority=priority,
        ai_category=ai_result["category"],
        ai_priority=ai_result["priority"],
        ai_confidence=ai_result["confidence"],
        ai_summary=ai_result["summary"],
        ai_tags=ai_result["tags"],
        sla_hours=ai_result["sla_hours"],
        due_date=datetime.now(timezone.utc) + timedelta(hours=ai_result["sla_hours"]),
        client_id=current_user.id,
        status=TicketStatus.OPEN
    )
    db.add(ticket)
    db.flush()

    log_audit(db, ticket.id, current_user.id, "ticket_created",
              f"Ticket {ticket.ticket_number} created by {current_user.full_name}")

    admins = db.query(User).filter(User.role == UserRole.ADMIN, User.is_active == True).all()
    for admin in admins:
        create_notification(
            db, admin.id, NotificationType.TICKET_CREATED,
            "New Ticket Submitted",
            f"{current_user.full_name} submitted: {ticket_in.title}",
            ticket.id
        )

    db.commit()
    db.refresh(ticket)
    return _enrich_ticket(ticket, db)


@router.get("/", response_model=TicketListOut)
def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    category: Optional[TicketCategory] = None,
    search: Optional[str] = None,
    assigned_to_me: bool = False,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Ticket).options(
        joinedload(Ticket.client),
        joinedload(Ticket.assigned_to)
    )

    if current_user.role == UserRole.CLIENT:
        query = query.filter(Ticket.client_id == current_user.id)
    elif current_user.role == UserRole.STAFF:
        if assigned_to_me:
            query = query.filter(Ticket.assigned_to_id == current_user.id)

    # Staff/admin can filter by a specific client to see that client's full ticket history
    if client_id and current_user.role in (UserRole.STAFF, UserRole.ADMIN):
        query = query.filter(Ticket.client_id == client_id)

    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if category:
        query = query.filter(Ticket.category == category)
    if search:
        query = query.filter(
            or_(
                Ticket.title.ilike(f"%{search}%"),
                Ticket.description.ilike(f"%{search}%"),
                Ticket.ticket_number.ilike(f"%{search}%")
            )
        )

    total = query.count()
    tickets = (
        query.order_by(Ticket.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return TicketListOut(
        tickets=[_enrich_ticket(t, db) for t in tickets],
        total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = _get_ticket_or_404(ticket_id, db, current_user)
    return _enrich_ticket(ticket, db)


@router.patch("/{ticket_id}", response_model=TicketOut)
def update_ticket(
    ticket_id: int,
    ticket_in: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = _get_ticket_or_404(ticket_id, db, current_user)

    if current_user.role == UserRole.CLIENT:
        if ticket.status != TicketStatus.OPEN:
            raise HTTPException(403, "Cannot edit ticket that is already in progress")
        allowed = {"title", "description"}
        update_data = {k: v for k, v in ticket_in.model_dump(exclude_none=True).items() if k in allowed}
    else:
        update_data = ticket_in.model_dump(exclude_none=True)

    for field, value in update_data.items():
        old_val = str(getattr(ticket, field))
        setattr(ticket, field, value)
        log_audit(db, ticket.id, current_user.id, f"{field}_changed",
                  f"{field} updated by {current_user.full_name}", field, old_val, str(value))

    if ticket_in.status == TicketStatus.RESOLVED and ticket.resolved_at is None:
        ticket.resolved_at = datetime.now(timezone.utc)
        create_notification(
            db, ticket.client_id, NotificationType.TICKET_RESOLVED,
            "Your ticket has been resolved",
            f"Ticket {ticket.ticket_number}: {ticket.title} has been resolved.",
            ticket.id
        )

    if ticket_in.assigned_to_id:
        assigned_user = db.query(User).filter(User.id == ticket_in.assigned_to_id).first()
        if assigned_user:
            create_notification(
                db, assigned_user.id, NotificationType.TICKET_ASSIGNED,
                "Ticket Assigned to You",
                f"You have been assigned ticket {ticket.ticket_number}: {ticket.title}",
                ticket.id
            )

    db.commit()
    db.refresh(ticket)
    return _enrich_ticket(ticket, db)


@router.post("/{ticket_id}/reclassify", response_model=TicketOut)
def reclassify_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN))
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    result = classifier.classify(ticket.title, ticket.description)
    ticket.ai_category = result["category"]
    ticket.ai_priority = result["priority"]
    ticket.ai_confidence = result["confidence"]
    ticket.ai_summary = result["summary"]
    ticket.ai_tags = result["tags"]

    log_audit(db, ticket.id, current_user.id, "reclassified",
              f"Ticket re-classified by AI (confidence: {result['confidence']})")
    db.commit()
    db.refresh(ticket)
    return _enrich_ticket(ticket, db)


@router.post("/{ticket_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    ticket_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = _get_ticket_or_404(ticket_id, db, current_user)

    if comment_in.is_internal and current_user.role == UserRole.CLIENT:
        comment_in.is_internal = False

    comment = Comment(
        content=comment_in.content,
        is_internal=comment_in.is_internal,
        ticket_id=ticket_id,
        author_id=current_user.id
    )
    db.add(comment)
    db.flush()

    notify_user_id = None
    if current_user.id != ticket.client_id and not comment_in.is_internal:
        notify_user_id = ticket.client_id
    elif current_user.id == ticket.client_id and ticket.assigned_to_id:
        notify_user_id = ticket.assigned_to_id

    if notify_user_id:
        create_notification(
            db, notify_user_id, NotificationType.COMMENT_ADDED,
            "New Comment on Ticket",
            f"{current_user.full_name} commented on {ticket.ticket_number}",
            ticket_id
        )

    db.commit()
    db.refresh(comment)
    return comment


@router.get("/{ticket_id}/comments", response_model=list[CommentOut])
def get_comments(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = _get_ticket_or_404(ticket_id, db, current_user)
    query = db.query(Comment).filter(Comment.ticket_id == ticket_id)

    if current_user.role == UserRole.CLIENT:
        query = query.filter(Comment.is_internal == False)

    return query.order_by(Comment.created_at.asc()).all()


@router.get("/{ticket_id}/audit", response_model=list[AuditLogOut])
def get_audit_log(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN))
):
    return (
        db.query(AuditLog)
        .filter(AuditLog.ticket_id == ticket_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


def _get_ticket_or_404(ticket_id: int, db: Session, current_user: User) -> Ticket:
    ticket = (
        db.query(Ticket)
        .options(joinedload(Ticket.client), joinedload(Ticket.assigned_to))
        .filter(Ticket.id == ticket_id)
        .first()
    )
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    if current_user.role == UserRole.CLIENT and ticket.client_id != current_user.id:
        raise HTTPException(403, "Access denied")
    return ticket


def _enrich_ticket(ticket: Ticket, db: Session) -> TicketOut:
    comment_count = db.query(func.count(Comment.id)).filter(
        Comment.ticket_id == ticket.id
    ).scalar()
    ticket_dict = {
        **{c.name: getattr(ticket, c.name) for c in ticket.__table__.columns},
        "client": ticket.client,
        "assigned_to": ticket.assigned_to,
        "comment_count": comment_count,
    }
    return TicketOut(**ticket_dict)



@router.post("/{ticket_id}/escalate", response_model=TicketOut)
def escalate_ticket(
    ticket_id: int,
    payload: EscalateTicketRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN))
):
    """Staff or admin hands a ticket off to a specific colleague, with a reason.
    Distinct from automatic SLA-breach escalation - this is person-initiated."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    target_user = db.query(User).filter(
        User.id == payload.to_user_id,
        User.role.in_([UserRole.STAFF, UserRole.ADMIN]),
        User.is_active == True,
    ).first()
    if not target_user:
        raise HTTPException(404, "Target staff member not found or inactive")

    if target_user.id == current_user.id:
        raise HTTPException(400, "Cannot escalate a ticket to yourself")

    previous_assignee = ticket.assigned_to.full_name if ticket.assigned_to else "Unassigned"
    ticket.assigned_to_id = target_user.id
    db.commit()
    db.refresh(ticket)

    log_audit(
        db, ticket.id, current_user.id, "manually_escalated",
        current_user.full_name + " escalated this ticket from " + previous_assignee + " to " + target_user.full_name + ". Reason: " + payload.reason
    )

    create_notification(
        db, target_user.id, NotificationType.TICKET_ESCALATED,
        "Ticket escalated to you",
        current_user.full_name + " escalated \"" + ticket.title + "\" to you: " + payload.reason,
        ticket_id=ticket.id,
    )

    admins = db.query(User).filter(User.role == UserRole.ADMIN, User.is_active == True, User.id != current_user.id).all()
    for admin in admins:
        create_notification(
            db, admin.id, NotificationType.TICKET_ESCALATED,
            "Ticket manually escalated",
            current_user.full_name + " escalated ticket " + ticket.ticket_number + " to " + target_user.full_name + ".",
            ticket_id=ticket.id,
        )

    db.commit()

    comment_count = db.query(Comment).filter(Comment.ticket_id == ticket.id).count()
    ticket_dict = {
        **{c.name: getattr(ticket, c.name) for c in ticket.__table__.columns},
        "client": ticket.client,
        "assigned_to": ticket.assigned_to,
        "comment_count": comment_count,
    }
    return TicketOut(**ticket_dict)


@router.get("/escalations/all", response_model=list[EscalationOut])
def list_escalations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """All escalations - both automatic (SLA breach) and manual (staff handoff) -
    for management oversight."""
    logs = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.user), joinedload(AuditLog.ticket))
        .filter(AuditLog.action.in_(["sla_breach_escalated", "manually_escalated"]))
        .order_by(AuditLog.created_at.desc())
        .limit(200)
        .all()
    )
    results = []
    for log in logs:
        if not log.ticket:
            continue
        comment_count = db.query(Comment).filter(Comment.ticket_id == log.ticket.id).count()
        ticket_dict = {
            **{c.name: getattr(log.ticket, c.name) for c in log.ticket.__table__.columns},
            "client": log.ticket.client,
            "assigned_to": log.ticket.assigned_to,
            "comment_count": comment_count,
        }
        results.append(EscalationOut(
            id=log.id,
            action=log.action,
            description=log.description,
            user=log.user,
            ticket=TicketOut(**ticket_dict),
            created_at=log.created_at,
        ))
    return results


@router.get("/audit-trail/all", response_model=list[EscalationOut])
def list_audit_trail(
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Full system-wide audit trail for management oversight - every logged
    action across every ticket, optionally filtered by action type."""
    query = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.user), joinedload(AuditLog.ticket))
        .filter(AuditLog.ticket_id.isnot(None))
    )
    if action:
        query = query.filter(AuditLog.action == action)
    logs = query.order_by(AuditLog.created_at.desc()).limit(300).all()

    results = []
    for log in logs:
        if not log.ticket:
            continue
        comment_count = db.query(Comment).filter(Comment.ticket_id == log.ticket.id).count()
        ticket_dict = {
            **{c.name: getattr(log.ticket, c.name) for c in log.ticket.__table__.columns},
            "client": log.ticket.client,
            "assigned_to": log.ticket.assigned_to,
            "comment_count": comment_count,
        }
        results.append(EscalationOut(
            id=log.id,
            action=log.action,
            description=log.description,
            user=log.user,
            ticket=TicketOut(**ticket_dict),
            created_at=log.created_at,
        ))
    return results
