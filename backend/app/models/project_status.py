from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class ProjectStatus(Base):
    __tablename__ = "project_statuses"

    status_id = Column(Integer, primary_key=True, index=True)

    status_name = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    description = Column(Text)

    projects = relationship(
        "Project",
        back_populates="status",
    )