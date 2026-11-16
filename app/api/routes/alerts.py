
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.application import Application
from app.models.user import User
from app.schemas.alert import AlertResponse


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


def get_user_alert(
    alert_id: int,
    user_id: int,
    db: Session
) -> Alert:

    statement = (
        select(Alert)
        .join(Incident, Alert.incident_id == Incident.id)
        .join(Application, Incident.application_id == Application.id)
        .where(
            Alert.id == alert_id,
            Application.user_id == user_id
        )
    )

    alert = db.scalar(statement)

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return alert


@router.get("/", response_model=list[AlertResponse])
def list_alerts(
    alert_status: str | None = Query(
        default=None,
        alias="status"
    ),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    statement = (
        select(Alert)
        .join(Incident, Alert.incident_id == Incident.id)
        .join(Application, Incident.application_id == Application.id)
        .where(Application.user_id == current_user.id)
    )

    if alert_status:
        statement = statement.where(
            Alert.status == alert_status.lower()
        )

    statement = (
        statement
        .order_by(Alert.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return get_user_alert(
        alert_id=alert_id,
        user_id=current_user.id,
        db=db
    )


@router.patch("/{alert_id}/mark-sent", response_model=AlertResponse)
def mark_alert_as_sent(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    alert = get_user_alert(
        alert_id=alert_id,
        user_id=current_user.id,
        db=db
    )

    if alert.status != "sent":
        alert.status = "sent"
        alert.sent_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(alert)

    return alert
