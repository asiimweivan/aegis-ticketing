from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from typing import List

from app.db.session import get_db
from app.models.models import Ticket, User, UserRole, TicketStatus
from app.schemas.schemas import (
    AnalyticsDashboard, TicketStats, CategoryBreakdown,
    PriorityBreakdown, TrendPoint, StaffPerformance
)
from app.core.security import require_roles
from app.ml.classifier import detect_recurring_issues, classifier

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=AnalyticsDashboard)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.STAFF))
):
    base = db.query(Ticket)
    total = base.count()

    stats = TicketStats(
        total=total,
        open=base.filter(Ticket.status == TicketStatus.OPEN).count(),
        in_progress=base.filter(Ticket.status == TicketStatus.IN_PROGRESS).count(),
        resolved=base.filter(Ticket.status == TicketStatus.RESOLVED).count(),
        closed=base.filter(Ticket.status == TicketStatus.CLOSED).count(),
        pending=base.filter(Ticket.status == TicketStatus.PENDING).count(),
        sla_breached=base.filter(Ticket.sla_breached == True).count(),
        avg_resolution_hours=_avg_resolution_hours(db)
    )

    cat_rows = (
        db.query(Ticket.category, func.count(Ticket.id).label("cnt"))
        .group_by(Ticket.category).all()
    )
    category_breakdown = [
        CategoryBreakdown(
            category=row.category.value,
            count=row.cnt,
            percentage=round(row.cnt / total * 100, 1) if total else 0
        )
        for row in cat_rows
    ]

    pri_rows = (
        db.query(Ticket.priority, func.count(Ticket.id).label("cnt"))
        .group_by(Ticket.priority).all()
    )
    priority_breakdown = [
        PriorityBreakdown(
            priority=row.priority.value,
            count=row.cnt,
            percentage=round(row.cnt / total * 100, 1) if total else 0
        )
        for row in pri_rows
    ]

    weekly_trend = _build_trend(db, days=7)
    monthly_trend = _build_trend(db, days=30)
    top_staff = _staff_performance(db)

    recent_tickets = (
        db.query(Ticket)
        .filter(Ticket.created_at >= datetime.now(timezone.utc) - timedelta(days=30))
        .all()
    )
    ticket_dicts = [
        {"category": t.category.value, "ai_tags": t.ai_tags}
        for t in recent_tickets
    ]
    recurring = detect_recurring_issues(ticket_dicts)

    return AnalyticsDashboard(
        stats=stats,
        category_breakdown=category_breakdown,
        priority_breakdown=priority_breakdown,
        weekly_trend=weekly_trend,
        monthly_trend=monthly_trend,
        top_staff=top_staff,
        recurring_issues=recurring
    )


@router.get("/my-stats")
def my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN))
):
    base = db.query(Ticket).filter(Ticket.assigned_to_id == current_user.id)
    total = base.count()
    resolved = base.filter(Ticket.status == TicketStatus.RESOLVED).count()

    return {
        "total_assigned": total,
        "resolved": resolved,
        "open": base.filter(Ticket.status == TicketStatus.OPEN).count(),
        "in_progress": base.filter(Ticket.status == TicketStatus.IN_PROGRESS).count(),
        "resolution_rate": round(resolved / total * 100, 1) if total else 0,
        "avg_resolution_hours": _avg_resolution_hours(db, staff_id=current_user.id)
    }


@router.post("/retrain-ml")
def retrain_ml_model(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    resolved_tickets = (
        db.query(Ticket)
        .filter(Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]))
        .all()
    )
    if len(resolved_tickets) < 20:
        return {"message": f"Need at least 20 resolved tickets. Currently have {len(resolved_tickets)}."}

    texts = [f"{t.title} {t.description}" for t in resolved_tickets]
    categories = [t.category.value for t in resolved_tickets]
    priorities = [t.priority.value for t in resolved_tickets]

    success = classifier.train(texts, categories, priorities)
    if success:
        return {"message": f"ML model retrained on {len(texts)} tickets successfully."}
    return {"message": "Training failed. Check logs."}


def _avg_resolution_hours(db: Session, staff_id: int = None):
    query = db.query(Ticket).filter(
        Ticket.resolved_at.isnot(None),
        Ticket.created_at.isnot(None)
    )
    if staff_id:
        query = query.filter(Ticket.assigned_to_id == staff_id)

    tickets = query.all()
    if not tickets:
        return None

    total_hours = sum(
        (t.resolved_at - t.created_at).total_seconds() / 3600
        for t in tickets if t.resolved_at and t.created_at
    )
    return round(total_hours / len(tickets), 1)


def _build_trend(db: Session, days: int) -> List[TrendPoint]:
    start = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        db.query(
            func.date(Ticket.created_at).label("date"),
            func.count(Ticket.id).label("count")
        )
        .filter(Ticket.created_at >= start)
        .group_by(func.date(Ticket.created_at))
        .order_by(func.date(Ticket.created_at))
        .all()
    )
    return [TrendPoint(date=str(r.date), count=r.count) for r in rows]


def _staff_performance(db: Session) -> List[StaffPerformance]:
    staff_users = db.query(User).filter(
        User.role.in_([UserRole.STAFF, UserRole.ADMIN]),
        User.is_active == True
    ).all()

    results = []
    for staff in staff_users:
        assigned = db.query(Ticket).filter(Ticket.assigned_to_id == staff.id).count()
        resolved = db.query(Ticket).filter(
            Ticket.assigned_to_id == staff.id,
            Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED])
        ).count()
        results.append(StaffPerformance(
            staff=staff,
            assigned=assigned,
            resolved=resolved,
            avg_resolution_hours=_avg_resolution_hours(db, staff.id),
            resolution_rate=round(resolved / assigned * 100, 1) if assigned else 0
        ))

    return sorted(results, key=lambda x: x.resolved, reverse=True)[:5]