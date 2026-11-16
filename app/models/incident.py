
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="high"
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="open"
    )

    fingerprint: Mapped[str] = mapped_column(
        String(64),
        nullable=False
    )

    occurrence_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1
    )

    first_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    application = relationship(
        "Application",
        back_populates="incidents"
    )

    alerts = relationship(
        "Alert",
        back_populates="incident",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index(
            "ix_incidents_application_status",
            "application_id",
            "status"
        ),
        Index(
            "ix_incidents_fingerprint",
            "application_id",
            "fingerprint"
        ),
    )
