
from app.db.session import SessionLocal


def get_task_db():
    """Create a database session for background tasks."""

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
