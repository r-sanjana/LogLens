
from sqlalchemy import select

from app.core.celery_app import celery_app
from app.db.session import SessionLocal

from app.models.alert import Alert
from app.models.incident import Incident
from app.models.application import Application
from app.models.user import User

from app.services.email_service import send_incident_email


@celery_app.task(
    name="app.tasks.notification_tasks.send_alert_notification",
    bind=True,
    max_retries=3
)
def send_alert_notification(self, alert_id: int):

    db = SessionLocal()

    try:
        result = db.execute(
            select(
                Alert,
                User.email,
                Incident.title,
                Incident.severity,
                Incident.description,
                Incident.occurrence_count,
            )
            .join(Incident, Alert.incident_id == Incident.id)
            .join(
                Application,
                Incident.application_id == Application.id
            )
            .join(User, Application.user_id == User.id)
            .where(Alert.id == alert_id)
        ).first()

        if result is None:
            return {
                "alert_id": alert_id,
                "status": "not_found"
            }

        (
            alert,
            recipient,
            title,
            severity,
            description,
            occurrence_count
        ) = result

        if alert.status == "sent":
            return {
                "alert_id": alert_id,
                "status": "already_sent"
            }

        if alert.channel != "email":
            raise ValueError(
                f"Unsupported notification channel: {alert.channel}"
            )

        send_incident_email(
            recipient=recipient,
            incident_title=title,
            severity=severity,
            description=description,
            occurrence_count=occurrence_count,
            incident_id=alert.incident_id
        )

        # Mark as sent only after SMTP accepts the message.
        alert.status = "sent"
        from datetime import datetime, timezone
        alert.sent_at = datetime.now(timezone.utc)

        db.commit()

        return {
            "alert_id": alert_id,
            "status": "sent",
            "recipient": recipient
        }

    except Exception as exc:
        db.rollback()

        if self.request.retries >= self.max_retries:
            failed_alert = db.scalar(
                select(Alert).where(Alert.id == alert_id)
            )

            if failed_alert and failed_alert.status != "sent":
                failed_alert.status = "failed"
                db.commit()

            raise

        raise self.retry(
            exc=exc,
            countdown=10 * (2 ** self.request.retries)
        )

    finally:
        db.close()
