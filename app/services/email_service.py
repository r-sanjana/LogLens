
import smtplib
import ssl

from email.message import EmailMessage

from app.core.config import settings


def send_incident_email(
    recipient: str,
    incident_title: str,
    severity: str,
    description: str,
    occurrence_count: int,
    incident_id: int
) -> None:

    if not settings.SMTP_EMAIL or not settings.SMTP_APP_PASSWORD:
        raise ValueError(
            "Gmail SMTP credentials are not configured"
        )

    message = EmailMessage()

    message["Subject"] = (
        f"[LogLens] {severity.upper()} Incident Detected"
    )

    message["From"] = settings.SMTP_EMAIL
    message["To"] = recipient

    message.set_content(
        f"""
Hello,

LogLens has detected a new application incident.

Incident ID: {incident_id}
Title: {incident_title}
Severity: {severity.upper()}
Occurrences: {occurrence_count}

Description:
{description or "No additional description available."}

Please investigate this incident through your LogLens dashboard.

Regards,
LogLens Monitoring System
"""
    )

    context = ssl.create_default_context()

    with smtplib.SMTP(
        settings.SMTP_HOST,
        587,
        timeout=settings.SMTP_TIMEOUT_SECONDS
    ) as smtp:

        smtp.ehlo()

        smtp.starttls(context=context)

        smtp.ehlo()

        smtp.login(
            settings.SMTP_EMAIL,
            settings.SMTP_APP_PASSWORD.replace(" ", "")
        )

        smtp.send_message(message)
