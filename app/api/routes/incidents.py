
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.incident import Incident
from app.models.application import Application
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.incident import IncidentResponse


router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


def get_user_incident(
    incident_id: int,
    user_id: int,
    db: Session
):
    statement = (
        select(Incident)
        .join(Application, Incident.application_id == Application.id)
        .where(
            Incident.id == incident_id,
            Application.user_id == user_id
        )
    )

    incident = db.scalar(statement)

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    return incident


@router.get(
    "/",
    response_model=list[IncidentResponse]
)
def list_incidents(
    incident_status: str | None = Query(default=None, alias="status"),
    severity: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    statement = (
        select(Incident)
        .join(Application, Incident.application_id == Application.id)
        .where(Application.user_id == current_user.id)
    )

    if incident_status:
        statement = statement.where(Incident.status == incident_status.lower())

    if severity:
        statement = statement.where(Incident.severity == severity.lower())

    statement = (
        statement
        .order_by(Incident.last_seen.desc())
        .offset(skip)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse
)
def get_incident(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_incident(
        incident_id,
        current_user.id,
        db
    )


@router.patch(
    "/{incident_id}/resolve",
    response_model=IncidentResponse
)
def resolve_incident(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = get_user_incident(
        incident_id,
        current_user.id,
        db
    )

    if incident.status != "resolved":
        incident.status = "resolved"
        incident.resolved_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(incident)

    return incident
