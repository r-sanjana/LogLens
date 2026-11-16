
from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.application import Application
from app.models.log import Log
from app.models.incident import Incident
from app.models.alert import Alert


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard Analytics"]
)


@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return overall monitoring statistics for the logged-in user."""

    application_ids = select(Application.id).where(
        Application.user_id == current_user.id
    )

    total_applications = db.scalar(
        select(func.count(Application.id)).where(
            Application.user_id == current_user.id
        )
    ) or 0

    total_logs = db.scalar(
        select(func.count(Log.id)).where(
            Log.application_id.in_(application_ids)
        )
    ) or 0

    log_counts = db.execute(
        select(
            func.upper(Log.level),
            func.count(Log.id)
        )
        .where(Log.application_id.in_(application_ids))
        .group_by(func.upper(Log.level))
    ).all()

    logs_by_level = {
        level: count for level, count in log_counts
    }

    total_incidents = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.application_id.in_(application_ids)
        )
    ) or 0

    open_incidents = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.application_id.in_(application_ids),
            Incident.status == "open"
        )
    ) or 0

    resolved_incidents = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.application_id.in_(application_ids),
            Incident.status == "resolved"
        )
    ) or 0

    total_alerts = db.scalar(
        select(func.count(Alert.id))
        .join(Incident, Alert.incident_id == Incident.id)
        .where(Incident.application_id.in_(application_ids))
    ) or 0

    pending_alerts = db.scalar(
        select(func.count(Alert.id))
        .join(Incident, Alert.incident_id == Incident.id)
        .where(
            Incident.application_id.in_(application_ids),
            Alert.status == "pending"
        )
    ) or 0

    sent_alerts = db.scalar(
        select(func.count(Alert.id))
        .join(Incident, Alert.incident_id == Incident.id)
        .where(
            Incident.application_id.in_(application_ids),
            Alert.status == "sent"
        )
    ) or 0

    return {
        "applications": {
            "total": total_applications
        },
        "logs": {
            "total": total_logs,
            "errors": logs_by_level.get("ERROR", 0),
            "warnings": logs_by_level.get("WARNING", 0),
            "info": logs_by_level.get("INFO", 0)
        },
        "incidents": {
            "total": total_incidents,
            "open": open_incidents,
            "resolved": resolved_incidents
        },
        "alerts": {
            "total": total_alerts,
            "pending": pending_alerts,
            "sent": sent_alerts
        }
    }


@router.get("/log-trends")
def get_log_trends(
    days: int = Query(default=7, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return daily log counts grouped by severity."""

    application_ids = select(Application.id).where(
        Application.user_id == current_user.id
    )

    start_date = date.today() - timedelta(days=days - 1)
    end_date = start_date + timedelta(days=days)

    log_date = func.date(Log.timestamp)

    results = db.execute(
        select(
            log_date.label("log_date"),
            func.upper(Log.level).label("level"),
            func.count(Log.id).label("count")
        )
        .where(
            Log.application_id.in_(application_ids),
            Log.timestamp >= datetime.combine(start_date, time.min),
            Log.timestamp < datetime.combine(end_date, time.min)
        )
        .group_by(log_date, func.upper(Log.level))
        .order_by(log_date)
    ).all()

    
    # Initialize every date in the requested period.
    trends = {}

    for offset in range(days):
        current_date = start_date + timedelta(days=offset)
        day = str(current_date)

        trends[day] = {
            "date": day,
            "errors": 0,
            "warnings": 0,
            "info": 0,
            "total": 0
        }

    # Map database severity levels to dashboard keys.
    level_mapping = {
        "ERROR": "errors",
        "WARNING": "warnings",
        "INFO": "info"
    }

    for row in results:
        day = str(row.log_date)
        level_key = level_mapping.get(row.level)

        if day in trends and level_key:
            trends[day][level_key] = row.count
            trends[day]["total"] += row.count

    return {
        "period_days": days,
        "trends": list(trends.values())
    }

