
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class APIKeyCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)


class APIKeyResponse(BaseModel):
    id: int
    application_id: int
    name: str
    key_prefix: str
    is_active: bool
    created_at: datetime
    last_used_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class APIKeyCreated(APIKeyResponse):
    api_key: str
