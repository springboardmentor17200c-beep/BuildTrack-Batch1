from sqlalchemy import Column, Integer, String, Date, DateTime, Time, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class WorkforceCategory(Base):
    __tablename__ = "workforce_categories"

    workforce_category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), unique=True, nullable=False)
    description = Column(String)

class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    employee_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    workforce_category_id = Column(Integer, ForeignKey("workforce_categories.workforce_category_id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    employee_code = Column(String(30), unique=True, nullable=False)
    joining_date = Column(Date, nullable=False)
    experience_years = Column(Numeric(4, 1))
    pay_rate = Column(Numeric(10, 2), nullable=False)
    payment_type = Column(String(20), nullable=False)
    employment_status = Column(String(20), default="Active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")
    category = relationship("WorkforceCategory")
    project = relationship("Project")

class Attendance(Base):
    __tablename__ = "attendance"

    attendance_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employee_profiles.employee_id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    attendance_date = Column(Date, nullable=False)
    check_in_time = Column(DateTime)
    check_out_time = Column(DateTime)
    attendance_status = Column(String(20), nullable=False)
    remarks = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("EmployeeProfile")

class Shift(Base):
    __tablename__ = "shifts"

    shift_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employee_profiles.employee_id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    shift_type = Column(String(20), nullable=False)   # Morning | Evening | Night
    shift_date = Column(Date, nullable=False)
    start_time = Column(String(20), nullable=False)   # stored as "08:00 AM"
    end_time = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("EmployeeProfile")
    project = relationship("Project")
