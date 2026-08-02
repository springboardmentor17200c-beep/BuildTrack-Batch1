from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
    TIMESTAMP,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"

    procurement_request_id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.project_id"),
        nullable=False,
    )

    requested_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
    )

    request_type = Column(
        String(30),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=False,
    )

    request_status = Column(
        String(30),
        nullable=False,
        default="Pending",
    )

    request_date = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    remarks = Column(Text)

    project = relationship(
        "Project",
        back_populates="procurement_requests",
    )

    requester = relationship(
        "User",
        foreign_keys=[requested_by],
        back_populates="procurement_requests",
    )
