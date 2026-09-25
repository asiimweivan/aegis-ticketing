from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.models import KnowledgeBase, User, UserRole, TicketCategory
from app.schemas.schemas import (
    KnowledgeBaseCreate, KnowledgeBaseUpdate, KnowledgeBaseOut, KnowledgeBaseListOut,
    MessageResponse,
)
from app.core.security import require_roles

router = APIRouter(prefix="/kb", tags=["Knowledge Base"])


@router.get("/", response_model=KnowledgeBaseListOut)
def list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[TicketCategory] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    # Public endpoint — no auth required, so visitors can self-serve before registering.
    query = db.query(KnowledgeBase)

    if category:
        query = query.filter(KnowledgeBase.category == category)
    if search:
        query = query.filter(
            or_(
                KnowledgeBase.title.ilike(f"%{search}%"),
                KnowledgeBase.problem_description.ilike(f"%{search}%"),
                KnowledgeBase.solution.ilike(f"%{search}%"),
            )
        )

    total = query.count()
    articles = (
        query.order_by(KnowledgeBase.views.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return KnowledgeBaseListOut(
        articles=articles,
        total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{article_id}", response_model=KnowledgeBaseOut)
def get_article(article_id: int, db: Session = Depends(get_db)):
    # Public — also increments the view counter.
    article = db.query(KnowledgeBase).filter(KnowledgeBase.id == article_id).first()
    if not article:
        raise HTTPException(404, "Article not found")

    article.views = (article.views or 0) + 1
    db.commit()
    db.refresh(article)
    return article


@router.post("/", response_model=KnowledgeBaseOut, status_code=201)
def create_article(
    article_in: KnowledgeBaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN)),
):
    article = KnowledgeBase(
        title=article_in.title,
        problem_description=article_in.problem_description,
        solution=article_in.solution,
        category=article_in.category,
        tags=article_in.tags,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.patch("/{article_id}", response_model=KnowledgeBaseOut)
def update_article(
    article_id: int,
    article_in: KnowledgeBaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN)),
):
    article = db.query(KnowledgeBase).filter(KnowledgeBase.id == article_id).first()
    if not article:
        raise HTTPException(404, "Article not found")

    update_data = article_in.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(article, field, value)

    db.commit()
    db.refresh(article)
    return article


@router.delete("/{article_id}", response_model=MessageResponse)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    article = db.query(KnowledgeBase).filter(KnowledgeBase.id == article_id).first()
    if not article:
        raise HTTPException(404, "Article not found")

    db.delete(article)
    db.commit()
    return MessageResponse(message="Article deleted successfully")


@router.post("/{article_id}/helpful", response_model=KnowledgeBaseOut)
def mark_helpful(article_id: int, db: Session = Depends(get_db)):
    # Public, unauthenticated — simple upvote, no per-user tracking (acceptable
    # for a lightweight "was this helpful" signal; a user could vote more than
    # once, which is a known simplification, not a security issue).
    article = db.query(KnowledgeBase).filter(KnowledgeBase.id == article_id).first()
    if not article:
        raise HTTPException(404, "Article not found")

    article.helpful_count = (article.helpful_count or 0) + 1
    db.commit()
    db.refresh(article)
    return article


REACTION_FIELDS = {
    "helpful": "helpful_count",
    "not_helpful": "not_helpful_count",
    "love": "love_count",
    "confused": "confused_count",
}


@router.post("/{article_id}/react/{reaction_type}", response_model=KnowledgeBaseOut)
def react_to_article(article_id: int, reaction_type: str, db: Session = Depends(get_db)):
    if reaction_type not in REACTION_FIELDS:
        raise HTTPException(400, "Invalid reaction type")

    article = db.query(KnowledgeBase).filter(KnowledgeBase.id == article_id).first()
    if not article:
        raise HTTPException(404, "Article not found")

    field_name = REACTION_FIELDS[reaction_type]
    current_value = getattr(article, field_name) or 0
    setattr(article, field_name, current_value + 1)
    db.commit()
    db.refresh(article)
    return article
    return article
