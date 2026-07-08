from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field

from auth import (
    FAKE_USER_DB,
    authenticate_user,
    clear_otp_data,
    create_access_token,
    generate_otp_code,
    get_current_user,
    get_user_by_phone,
    send_otp_to_phone,
    store_otp_for_phone,
    verify_password_reset_token,
    verify_phone_otp,
)
from models import RegistrationRequest, UserProfile

router = APIRouter()


class ForgotPasswordRequest(BaseModel):
    phone_number: str = Field(..., min_length=7)


class VerifyOtpRequest(BaseModel):
    phone_number: str
    otp_code: str


class ResetPasswordRequest(BaseModel):
    phone_number: str
    verification_token: str
    new_password: str = Field(..., min_length=6)


class SuccessResponse(BaseModel):
    message: str


class OtpVerificationResponse(BaseModel):
    verification_token: str


class ResetPasswordResponse(BaseModel):
    message: str


@router.post("/login")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> dict[str, str]:
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(user["username"])
    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/forgot-password", response_model=SuccessResponse, status_code=status.HTTP_200_OK
)
def forgot_password(payload: ForgotPasswordRequest):
    user = get_user_by_phone(payload.phone_number)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with that phone number not found",
        )

    otp_code = generate_otp_code()
    store_otp_for_phone(payload.phone_number, otp_code)
    send_otp_to_phone(payload.phone_number, otp_code)

    return {"message": "OTP sent to the provided phone number."}


@router.post(
    "/verify-otp",
    response_model=OtpVerificationResponse,
    status_code=status.HTTP_200_OK,
)
def verify_otp(payload: VerifyOtpRequest):
    verification_token = verify_phone_otp(payload.phone_number, payload.otp_code)
    return {"verification_token": verification_token}


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    status_code=status.HTTP_200_OK,
)
def reset_password(payload: ResetPasswordRequest):
    verify_password_reset_token(payload.phone_number, payload.verification_token)

    user = get_user_by_phone(payload.phone_number)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with that phone number not found",
        )

    user["password"] = payload.new_password
    clear_otp_data(payload.phone_number)

    return {"message": "Password has been reset successfully."}


@router.post(
    "/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED
)
def register(payload: RegistrationRequest):
    # Duplicate username check
    if payload.username in FAKE_USER_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    # Duplicate email check
    for existing in FAKE_USER_DB.values():
        if existing.get("email") == str(payload.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    # Create user metadata
    from datetime import datetime, timezone
    from uuid import uuid4

    user_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    new_user = {
        "user_id": user_id,
        "username": payload.username,
        "email": str(payload.email),
        "password": payload.password,  # stored as plain-text for now (mock DB)
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "phone_number": payload.phone_number,
        "role": payload.role.value,
        "company_name": payload.company_name,
        "tax_id": payload.tax_id,
        "employee_id": payload.employee_id,
        "skills_or_trade": payload.skills_or_trade,
        "assigned_projects": [],
        "is_active": True,
        "created_at": created_at,
    }

    # Persist to in-memory mock DB
    FAKE_USER_DB[payload.username] = new_user

    # Build response without the password
    response = UserProfile(
        user_id=user_id,
        username=new_user["username"],
        email=new_user["email"],
        first_name=new_user["first_name"],
        last_name=new_user["last_name"],
        phone_number=new_user["phone_number"],
        role=payload.role,
        company_name=new_user.get("company_name"),
        tax_id=new_user.get("tax_id"),
        employee_id=new_user.get("employee_id"),
        skills_or_trade=new_user.get("skills_or_trade"),
        assigned_projects=new_user.get("assigned_projects", []),
        is_active=new_user.get("is_active", True),
        created_at=new_user.get("created_at"),
    )

    return response


@router.get("/users/me")
def read_users_me(
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict[str, str]:
    return {
        "username": current_user["username"],
        "full_name": current_user["full_name"],
        "email": current_user["email"],
    }
