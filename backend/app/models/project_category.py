from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class ProjectCategory(Base):
    __tablename__ = "project_categories"

    category_id = Column(Integer, primary_key=True, index=True)

    category_name = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    description = Column(Text)

    projects = relationship(
        "Project",
        back_populates="category",
    )