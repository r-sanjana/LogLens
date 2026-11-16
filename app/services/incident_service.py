
import hashlib
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.models.log import Log
from app.services.alert_service import create_incident_alert


def generate_fingerprint(
    application_id: int,
    level: str,
    message: str,
    source: str | None
) -> str:

    raw_value = (
        f"{application_id}:"
        f"{level.upper()}:"
        f"{message.strip().lower()}:"
        f"{source or 'unknown'}"
    )

    return hashlib.sha256(
        raw_value.encode("utf-8")
    ).hexdigest()


def detect_or_update_incident(
    db: Session,
    log: Log
) -> Incident | None:

    if log.level.upper() != "ERROR":
        return None

    fingerprint = generate_fingerprint(
        application_id=log.application_id,
        level=log.level,
        message=log.message,
        source=log.source
    )

    incident = db.scalar(
        select(Incident).where(
            Incident.application_id == log.application_id,
            Incident.fingerprint == fingerprint,
            Incident.status == "open"
        )
    )

    new_alert = None

    if incident:
        incident.occurrence_count += 1
        incident.last_seen = datetime.now(timezone.utc)

    else:
        incident = Incident(
            application_id=log.application_id,
            title=log.message[:255],
            description=(
                f"Automatically detected error from "
                f"{log.source or 'unknown source'}"
            ),
            severity="high",
            status="open",
            fingerprint=fingerprint,
            occurrence_count=1,
            first_seen=log.timestamp,
            last_seen=log.timestamp
        )

        db.add(incident)
        db.flush()

        new_alert = create_incident_alert(db, incident)

    try:
        db.commit()
        db.refresh(incident)

    except Exception:
        db.rollback()
        raise

    # Enqueue notification only after the database commit.
    if new_alert is not None:
        from app.tasks.notification_tasks import (
            send_alert_notification
        )

        send_alert_notification.delay(new_alert.id)

    return incident
