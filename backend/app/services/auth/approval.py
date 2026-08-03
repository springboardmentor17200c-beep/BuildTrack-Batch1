from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.routes.serializers import serialize_user


def get_pending_employees(
    company_id: int,
    db: Session,
):
    employees = (
        db.query(User)
        .filter(
            User.company_id == company_id,
            User.registration_status == "Pending",
        )
        .all()
    )

    return {
        "success": True,
        "message": "Pending employees fetched successfully.",
        "data": [
            serialize_user(employee)
            for employee in employees
        ],
    }


def approve_employee(
    employee_id: int,
    admin: User,
    db: Session,
):
    employee = (
        db.query(User)
        .filter(
            User.user_id == employee_id,
            User.company_id == admin.company_id,
        )
        .first()
    )

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    if employee.registration_status == "Approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee is already approved.",
        )

    employee.registration_status = "Approved"
    employee.is_active = True
    employee.approved_by = admin.user_id
    employee.approved_at = datetime.now(timezone.utc)
    employee.rejected_reason = None

    db.commit()
    db.refresh(employee)

    return {
        "success": True,
        "message": "Employee approved successfully.",
        "data": serialize_user(employee),
    }


def reject_employee(
    employee_id: int,
    reason: str,
    admin: User,
    db: Session,
):
    employee = (
        db.query(User)
        .filter(
            User.user_id == employee_id,
            User.company_id == admin.company_id,
        )
        .first()
    )

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    if employee.registration_status == "Rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee is already rejected.",
        )

    employee.registration_status = "Rejected"
    employee.is_active = False
    employee.approved_by = admin.user_id
    employee.approved_at = datetime.now(timezone.utc)
    employee.rejected_reason = reason

    db.commit()
    db.refresh(employee)

    return {
        "success": True,
        "message": "Employee registration rejected.",
        "data": serialize_user(employee),
    }