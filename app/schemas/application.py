
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class ApplicationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None


class ApplicationUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )
    description: str | None = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
