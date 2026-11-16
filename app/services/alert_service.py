
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.incident import Incident


def create_incident_alert(
    db: Session,
    incident: Incident
) -> Alert:
    """Create an alert for a newly detected incident."""

    alert = Alert(
        incident_id=incident.id,
        channel="email",
        message=(
            f"LogLens detected a new incident: "
            f"{incident.title}. "
            f"Severity: {incident.severity}. "
            f"Occurrences: {incident.occurrence_count}."
        ),
        status="pending"
    )

    db.add(alert)
    db.flush()

    return alert
