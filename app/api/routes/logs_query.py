
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.application import Application
from app.models.log import Log
from app.models.user import User
from app.schemas.log import LogResponse


router = APIRouter(
    prefix="/applications/{application_id}/logs",
    tags=["Log Retrieval"]
)


def verify_application_access(
    application_id: int,
    current_user: User,
    db: Session
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )


@router.get("/", response_model=list[LogResponse])
def get_logs(
    application_id: int,
    level: str | None = Query(default=None),
    source: str | None = Query(default=None),
    search: str | None = Query(default=None),
    start_time: datetime | None = Query(default=None),
    end_time: datetime | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_application_access(application_id, current_user, db)

    query = db.query(Log).filter(
        Log.application_id == application_id
    )

    if level:
        query = query.filter(Log.level == level.upper())

    if source:
        query = query.filter(Log.source == source)

    if search:
        query = query.filter(Log.message.ilike(f"%{search}%"))

    if start_time:
        query = query.filter(Log.timestamp >= start_time)

    if end_time:
        query = query.filter(Log.timestamp <= end_time)

    if start_time and end_time and start_time > end_time:
        raise HTTPException(
            status_code=400,
            detail="start_time must be earlier than end_time"
        )

    return (
        query.order_by(Log.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
