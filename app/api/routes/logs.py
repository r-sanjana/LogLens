
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.api_key import APIKey
from app.models.log import Log
from app.schemas.log import LogCreate, LogResponse
from app.api.api_key_deps import get_application_api_key
from app.services.incident_service import detect_or_update_incident


router = APIRouter(
    prefix="/logs",
    tags=["Logs"]
)


@router.post(
    "/ingest",
    response_model=LogResponse,
    status_code=status.HTTP_201_CREATED
)
def ingest_log(
    log_data: LogCreate,
    api_key: APIKey = Depends(get_application_api_key),
    db: Session = Depends(get_db)
):
    # Create log associated with the authenticated application
    new_log = Log(
        application_id=api_key.application_id,
        level=log_data.level.upper(),
        message=log_data.message,
        source=log_data.source,
        metadata_=log_data.metadata,
        timestamp=log_data.timestamp
    )

    # Update API key usage timestamp
    api_key.last_used_at = datetime.now(timezone.utc)

    # Save the log
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    # Automatically detect or update an incident
    detect_or_update_incident(db, new_log)

    return new_log
