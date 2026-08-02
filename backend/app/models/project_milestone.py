from sqlalchemy import (
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
    Text,
    TIMESTAMP,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    milestone_id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.project_id"),
        nullable=False,
    )

    milestone_name = Column(
        String(150),
        nullable=False,
    )

    description = Column(Text)

    due_date = Column(
        Date,
        nullable=False,
    )

    completion_date = Column(Date)

    status = Column(
        String(30),
        nullable=False,
        default="Pending",
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now(),
    )

    project = relationship(
        "Project",
        back_populates="milestones",
    )