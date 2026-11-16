from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertResponse(BaseModel):
    id: int
    incident_id: int
    channel: str
    message: str
    status: str
    created_at: datetime
    sent_at: datetime | None

    model_config = ConfigDict(from_attributes=True)