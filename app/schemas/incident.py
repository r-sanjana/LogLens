
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IncidentResponse(BaseModel):
    id: int
    application_id: int
    title: str
    description: str | None
    severity: str
    status: str
    fingerprint: str
    occurrence_count: int
    first_seen: datetime
    last_seen: datetime
    resolved_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
