from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any
from datetime import datetime
from app.models.models import UserRole, TicketStatus, TicketPriority, TicketCategory, NotificationType


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    department: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CLIENT

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None


class UserOut(UserBase):
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TicketCreate(BaseModel):
    title: str
    description: str
    category: Optional[TicketCategory] = None
    priority: Optional[TicketPriority] = None


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    category: Optional[TicketCategory] = None
    assigned_to_id: Optional[int] = None
    due_date: Optional[datetime] = None


class AIClassificationResult(BaseModel):
    category: TicketCategory
    priority: TicketPriority
    confidence: float
    summary: str
    tags: List[str]


class TicketOut(BaseModel):
    id: int
    ticket_number: str
    title: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    category: TicketCategory
    ai_category: Optional[TicketCategory] = None
    ai_priority: Optional[TicketPriority] = None
    ai_confidence: Optional[float] = None
    ai_summary: Optional[str] = None
    ai_tags: Optional[List[str]] = None
    client: UserOut
    assigned_to: Optional[UserOut] = None
    sla_hours: Optional[int] = None
    sla_breached: bool = False
    due_date: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    comment_count: Optional[int] = 0

    class Config:
        from_attributes = True


class TicketListOut(BaseModel):
    tickets: List[TicketOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class CommentCreate(BaseModel):
    content: str
    is_internal: bool = False


class CommentOut(BaseModel):
    id: int
    content: str
    is_internal: bool
    author: UserOut
    ticket_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationOut(BaseModel):
    id: int
    type: NotificationType
    title: str
    message: str
    is_read: bool
    ticket_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TicketStats(BaseModel):
    total: int
    open: int
    in_progress: int
    resolved: int
    closed: int
    pending: int
    sla_breached: int
    avg_resolution_hours: Optional[float] = None


class CategoryBreakdown(BaseModel):
    category: str
    count: int
    percentage: float


class PriorityBreakdown(BaseModel):
    priority: str
    count: int
    percentage: float


class TrendPoint(BaseModel):
    date: str
    count: int


class StaffPerformance(BaseModel):
    staff: UserOut
    assigned: int
    resolved: int
    avg_resolution_hours: Optional[float] = None
    resolution_rate: float


class AnalyticsDashboard(BaseModel):
    stats: TicketStats
    category_breakdown: List[CategoryBreakdown]
    priority_breakdown: List[PriorityBreakdown]
    weekly_trend: List[TrendPoint]
    monthly_trend: List[TrendPoint]
    top_staff: List[StaffPerformance]
    recurring_issues: List[dict]


class AuditLogOut(BaseModel):
    id: int
    action: str
    field_changed: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    description: Optional[str] = None
    user: UserOut
    created_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str
    success: bool = True
    data: Optional[Any] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


Token.model_rebuild()