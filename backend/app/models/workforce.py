from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class WorkforceCategory(Base):
    __tablename__ = "workforce_categories"

    workforce_category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)

    employee_profiles = relationship("EmployeeProfile", back_populates="category")


class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    employee_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, unique=True)
    workforce_category_id = Column(
        Integer,
        ForeignKey("workforce_categories.workforce_category_id"),
        nullable=False,
    )
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    employee_code = Column(String(30), nullable=False, unique=True)
    joining_date = Column(Date, nullable=False)
    experience_years = Column(Numeric(4, 1))
    pay_rate = Column(Numeric(10, 2), nullable=False)
    payment_type = Column(String(20), nullable=False)
    employment_status = Column(String(20), nullable=False, default="Active")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="employee_profile")
    category = relationship("WorkforceCategory", back_populates="employee_profiles")
    project = relationship("Project", back_populates="employee_profiles")
