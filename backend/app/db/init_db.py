from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.models.models import Base, User, UserRole
from app.core.security import get_password_hash
from app.core.config import settings


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")


def seed_admin():
    """Create first admin account if none exists."""
    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not admin:
            admin = User(
                full_name=settings.FIRST_ADMIN_NAME,
                email=settings.FIRST_ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            db.commit()
            print(f"✅ Admin account created: {settings.FIRST_ADMIN_EMAIL}")
        else:
            print("ℹ️  Admin account already exists")
    finally:
        db.close()