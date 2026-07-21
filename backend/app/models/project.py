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


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)

    company_id = Column(
        Integer,
        ForeignKey("companies.company_id"),
        nullable=False,
    )

    manager_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
    )

    client_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
    )

    category_id = Column(
        Integer,
        ForeignKey("project_categories.category_id"),
        nullable=False,
    )

    status_id = Column(
        Integer,
        ForeignKey("project_statuses.status_id"),
        nullable=False,
    )

    project_name = Column(
        String(150),
        nullable=False,
    )

    description = Column(Text)

    location = Column(
        Text,
        nullable=False,
    )

    start_date = Column(
        Date,
        nullable=False,
    )

    expected_end_date = Column(
        Date,
        nullable=False,
    )

    actual_end_date = Column(Date)

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now(),
    )

    company = relationship(
        "Company",
        back_populates="projects",
    )

    manager = relationship(
        "User",
        foreign_keys=[manager_id],
        back_populates="managed_projects",
    )

    client = relationship(
        "User",
        foreign_keys=[client_id],
        back_populates="client_projects",
    )

    category = relationship(
        "ProjectCategory",
        back_populates="projects",
    )

    status = relationship(
        "ProjectStatus",
        back_populates="projects",
    )

    milestones = relationship(
        "ProjectMilestone",
        back_populates="project",
        cascade="all, delete-orphan",
    )