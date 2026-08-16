from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime

from app.db.database import get_db
from app.core.permissions import require_roles
from app.models.workforce import EmployeeProfile, WorkforceCategory, Attendance, Shift
from app.models.project import Project
from app.models.user import User
from app.schemas.workforce import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse,
    AttendanceCreate, AttendanceResponse,
    ShiftCreate, ShiftResponse,
    WorkforceCategoryResponse,
)

router = APIRouter(prefix="/workforce", tags=["Workforce"])

ALL_ROLES = ("Administrator", "Project Manager", "Site Engineer")
MANAGE_ROLES = ("Administrator", "Project Manager")


def _employee_to_response(emp: EmployeeProfile) -> EmployeeResponse:
    """Convert ORM row (with joined relationships) to response schema."""
    return EmployeeResponse(
        employee_id=emp.employee_id,
        employee_code=emp.employee_code,
        full_name=emp.user.full_name if emp.user else "Unknown",
        contact=getattr(emp.user, "contact_number", None),
        category_name=emp.category.category_name if emp.category else "",
        project_name=emp.project.project_name if emp.project else "",
        project_id=emp.project_id,
        joining_date=emp.joining_date,
        experience_years=float(emp.experience_years) if emp.experience_years is not None else None,
        pay_rate=float(emp.pay_rate),
        payment_type=emp.payment_type,
        employment_status=emp.employment_status,
    )


def _attendance_to_response(att: Attendance) -> AttendanceResponse:
    emp = att.employee
    full_name = emp.user.full_name if emp and emp.user else "Unknown"
    return AttendanceResponse(
        attendance_id=att.attendance_id,
        employee_id=att.employee_id,
        employee_name=full_name,
        project_id=att.project_id,
        attendance_date=att.attendance_date,
        attendance_status=att.attendance_status,
        check_in_time=att.check_in_time,
        check_out_time=att.check_out_time,
        remarks=att.remarks,
    )


def _shift_to_response(shift: Shift) -> ShiftResponse:
    emp = shift.employee
    full_name = emp.user.full_name if emp and emp.user else "Unknown"
    project_name = shift.project.project_name if shift.project else ""
    return ShiftResponse(
        shift_id=shift.shift_id,
        employee_id=shift.employee_id,
        employee_name=full_name,
        project_id=shift.project_id,
        project_name=project_name,
        shift_type=shift.shift_type,
        shift_date=shift.shift_date,
        start_time=shift.start_time,
        end_time=shift.end_time,
    )


# ── Workforce Categories ─────────────────────────────
@router.get("/categories", response_model=List[WorkforceCategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    return db.query(WorkforceCategory).all()


# ── Employees ─────────────────────────────────────────
@router.get("/employees", response_model=List[EmployeeResponse])
def get_employees(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    employees = db.query(EmployeeProfile).all()
    return [_employee_to_response(e) for e in employees]


@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    # Resolve or create User
    user_id = payload.user_id
    if not user_id and payload.full_name:
        ts = int(datetime.utcnow().timestamp())
        fake_email = f"{payload.full_name.lower().replace(' ', '')}{ts}@buildtrack.local"
        user = User(
            full_name=payload.full_name,
            email=fake_email,
            password_hash="N/A",
            phone_number="N/A"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.user_id
        
    if not user_id or not db.query(User).filter(User.user_id == user_id).first():
        raise HTTPException(status_code=404, detail="User not found and could not be created.")

    # Resolve or create Workforce Category
    cat_id = payload.workforce_category_id
    if not cat_id and payload.category_name:
        cat = db.query(WorkforceCategory).filter(WorkforceCategory.category_name == payload.category_name).first()
        if not cat:
            cat = WorkforceCategory(category_name=payload.category_name)
            db.add(cat)
            db.commit()
            db.refresh(cat)
        cat_id = cat.workforce_category_id
        
    # Resolve or create Project
    proj_id = payload.project_id
    if not proj_id and payload.project_name:
        proj = db.query(Project).filter(Project.project_name == payload.project_name).first()
        if not proj:
            proj = Project(project_name=payload.project_name, status="Planning")
            db.add(proj)
            db.commit()
            db.refresh(proj)
        proj_id = proj.project_id

    # Prevent duplicate employee codes
    if db.query(EmployeeProfile).filter(
        EmployeeProfile.employee_code == payload.employee_code
    ).first():
        raise HTTPException(status_code=409, detail="Employee code already exists.")

    emp_data = payload.model_dump(exclude={"full_name", "category_name", "project_name"})
    emp_data["user_id"] = user_id
    emp_data["workforce_category_id"] = cat_id
    emp_data["project_id"] = proj_id

    emp = EmployeeProfile(**emp_data)
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return _employee_to_response(emp)


@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    emp = db.query(EmployeeProfile).filter(
        EmployeeProfile.employee_id == employee_id
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(emp, key, value)

    db.commit()
    db.refresh(emp)
    return _employee_to_response(emp)


# ── Attendance ─────────────────────────────────────────
@router.get("/attendance", response_model=List[AttendanceResponse])
def get_attendance(
    attendance_date: Optional[date] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    q = db.query(Attendance)
    if attendance_date:
        q = q.filter(Attendance.attendance_date == attendance_date)
    records = q.order_by(Attendance.attendance_date.desc()).all()
    return [_attendance_to_response(r) for r in records]


@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    emp = db.query(EmployeeProfile).filter(
        EmployeeProfile.employee_id == payload.employee_id
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")

    # Upsert: update existing record for this employee+date, or create new
    existing = db.query(Attendance).filter(
        Attendance.employee_id == payload.employee_id,
        Attendance.attendance_date == payload.attendance_date,
    ).first()

    if existing:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return _attendance_to_response(existing)

    record = Attendance(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return _attendance_to_response(record)


@router.post("/attendance/bulk", response_model=List[AttendanceResponse], status_code=status.HTTP_201_CREATED)
def mark_all_present(
    attendance_date: date = Query(..., description="Date to mark all active employees present"),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    """Mark all active employees as Present for the given date (skips already-marked)."""
    active_employees = db.query(EmployeeProfile).filter(
        EmployeeProfile.employment_status == "Active"
    ).all()

    already_marked = {
        a.employee_id
        for a in db.query(Attendance).filter(
            Attendance.attendance_date == attendance_date
        ).all()
    }

    now = datetime.utcnow().replace(hour=8, minute=0, second=0, microsecond=0)
    new_records = []
    for emp in active_employees:
        if emp.employee_id in already_marked:
            continue
        record = Attendance(
            employee_id=emp.employee_id,
            project_id=emp.project_id,
            attendance_date=attendance_date,
            attendance_status="Present",
            check_in_time=now,
        )
        db.add(record)
        new_records.append(record)

    db.commit()
    for r in new_records:
        db.refresh(r)

    return [_attendance_to_response(r) for r in new_records]


# ── Shifts ──────────────────────────────────────────────
@router.get("/shifts", response_model=List[ShiftResponse])
def get_shifts(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    shifts = db.query(Shift).order_by(Shift.shift_date.desc()).all()
    return [_shift_to_response(s) for s in shifts]


@router.post("/shifts", response_model=ShiftResponse, status_code=status.HTTP_201_CREATED)
def create_shift(
    payload: ShiftCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*MANAGE_ROLES)),
):
    if not db.query(EmployeeProfile).filter(
        EmployeeProfile.employee_id == payload.employee_id
    ).first():
        raise HTTPException(status_code=404, detail="Employee not found.")

    shift = Shift(**payload.model_dump())
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return _shift_to_response(shift)


@router.delete("/shifts/{shift_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*MANAGE_ROLES)),
):
    shift = db.query(Shift).filter(Shift.shift_id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found.")
    db.delete(shift)
    db.commit()
