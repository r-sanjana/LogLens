
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field, ConfigDict


class LogCreate(BaseModel):
    level: str = Field(min_length=1, max_length=20)
    message: str = Field(min_length=1)
    source: str | None = Field(default=None, max_length=255)
    metadata: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class LogResponse(BaseModel):
    id: int
    application_id: int
    level: str
    message: str
    source: str | None

    # Read metadata_ from SQLAlchemy, but return it as "metadata"
    metadata: dict[str, Any] = Field(validation_alias="metadata_")

    timestamp: datetime
    received_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )
