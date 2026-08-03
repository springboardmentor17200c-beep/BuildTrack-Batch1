from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.core.roles import ADMIN
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import (
    CompanyRegisterRequest,
    EmployeeRegisterRequest,
    LoginRequest,
    RejectionRequest,
    RequestOtpRequest,
    VerifyOtpRequest,
    VerifyOtpResponse,
    ResetPasswordRequest,
)
from app.services.auth.password_reset import (
    request_otp,
    verify_otp,
    reset_password,
)
from app.schemas.response import ApiResponse
from app.services.auth import (
    approve_employee as approve_employee_service,
    authenticate_user,
    get_pending_employees as get_pending_employees_service,
    register_company as register_company_service,
    register_employee as register_employee_service,
    reject_employee as reject_employee_service,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/company/register",
    response_model=ApiResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_company(
    payload: CompanyRegisterRequest,
    db: Session = Depends(get_db),
):
    return register_company_service(payload, db)


@router.post(
    "/employee/register",
    response_model=ApiResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_employee(
    payload: EmployeeRegisterRequest,
    db: Session = Depends(get_db),
):
    return register_employee_service(payload, db)


@router.post(
    "/login",
    response_model=ApiResponse,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    return authenticate_user(payload, db)


@router.get(
    "/pending-employees",
    response_model=ApiResponse,
)
def get_pending_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(ADMIN)),
):
    return get_pending_employees_service(current_user.company_id, db)


@router.put(
    "/approve/{employee_id}",
    response_model=ApiResponse,
)
def approve_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(ADMIN)),
):
    return approve_employee_service(employee_id, current_user, db)


@router.put(
    "/reject/{employee_id}",
    response_model=ApiResponse,
)
def reject_employee(
    employee_id: int,
    payload: RejectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(ADMIN)),
):
    return reject_employee_service(employee_id, payload.reason, current_user, db)

@router.post(
    "/request-otp",
    summary="Request Password Reset OTP",
)
def request_password_reset_otp(
    payload: RequestOtpRequest,
    db: Session = Depends(get_db),
):
    return request_otp(
        payload=payload,
        db=db,
    )

@router.post(
    "/verify-otp",
    response_model=VerifyOtpResponse,
    summary="Verify Password Reset OTP",
)
def verify_password_reset_otp(
    payload: VerifyOtpRequest,
    db: Session = Depends(get_db),
):
    return verify_otp(
        payload=payload,
        db=db,
    )

@router.post(
    "/reset-password",
    summary="Reset Password",
)
def reset_user_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    return reset_password(
        payload=payload,
        db=db,
    )