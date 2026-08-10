from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from sqlalchemy import or_, func
from app.db.database import get_db
from app.models.user import User
from app.models.role import Role
from app.models.company import Company
from app.schemas.auth import (
    RegisterRequest,
    ChangePasswordRequest,
    Token,
)
from app.schemas.user import UserResponse, UserUpdate


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

def build_user_response(user: User) -> UserResponse:
    role_name = user.role.role_name if user.role else None
    return UserResponse(
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        phone_number=user.phone_number,
        company_id=user.company_id,
        role_id=user.role_id,
        role=role_name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(func.lower(User.email) == payload.email.lower())
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    # Compute full_name
    name = payload.full_name
    if not name:
        parts = [p for p in [payload.first_name, payload.last_name] if p]
        name = " ".join(parts) if parts else (payload.username or payload.email.split("@")[0])

    # Resolve role_id
    role_id = payload.role_id
    if not role_id and payload.role:
        role_obj = db.query(Role).filter(Role.role_name == payload.role).first()
        if not role_obj:
            role_obj = Role(role_name=payload.role, description=f"{payload.role} role")
            db.add(role_obj)
            db.commit()
            db.refresh(role_obj)
        role_id = role_obj.role_id

    # Resolve company_id
    company_id = payload.company_id
    if not company_id and payload.company_name:
        company_obj = db.query(Company).filter(Company.company_name == payload.company_name).first()
        if not company_obj:
            ts = int(datetime.utcnow().timestamp())
            code = f"CMP-{ts}"
            company_obj = Company(
                company_name=payload.company_name,
                company_code=code,
                company_email=f"contact_{ts}@{payload.company_name.lower().replace(' ', '')}.com",
                company_phone=payload.phone_number or "0000000000",
                address="N/A"
            )
            db.add(company_obj)
            db.commit()
            db.refresh(company_obj)
        company_id = company_obj.company_id

    user = User(
        full_name=name,
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone_number=payload.phone_number,
        company_id=company_id,
        role_id=role_id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return build_user_response(user)


@router.post(
    "/login",
    response_model=Token,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    identifier = (form_data.username or "").strip().lower()
    print(f"LOGIN ATTEMPT: identifier='{identifier}', raw_username='{form_data.username}', password='{form_data.password}'")
    user = (
        db.query(User)
        .filter(
            or_(
                func.lower(User.email) == identifier,
                func.lower(User.username) == identifier,
                func.lower(User.full_name) == identifier,
            )
        )
        .first()
    )

    if not user:
        print("LOGIN FAILED: User not found in DB")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        form_data.password,
        user.password_hash,
    ):
        print("LOGIN FAILED: Password verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    access_token = create_access_token(
        data={
            "user_id": user.user_id,
            "email": user.email,
            "role_id": user.role_id,
        },
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return build_user_response(current_user)


@router.put(
    "/me",
    response_model=UserResponse,
)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    if payload.phone_number is not None:
        current_user.phone_number = payload.phone_number

    if payload.profile_image is not None:
        current_user.profile_image = payload.profile_image

    db.commit()
    db.refresh(current_user)

    return current_user


@router.put("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(
        payload.current_password,
        current_user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    current_user.password_hash = hash_password(
        payload.new_password
    )

    db.commit()

    return {
        "message": "Password updated successfully."
    }