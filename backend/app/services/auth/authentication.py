from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import LoginRequest, Token


def authenticate_user(
    payload: LoginRequest,
    db: Session,
):
    """
    Authenticate a user and generate a JWT.
    """

    user = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled.",
        )

    if user.registration_status == "Pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your registration is awaiting administrator approval.",
        )

    if user.registration_status == "Rejected":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=user.rejected_reason
            or "Your registration has been rejected.",
        )

    user.last_login = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user)

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

    return {
        "success": True,
        "message": "Login successful.",
        "data": {
            "token": Token(
                access_token=access_token,
                token_type="bearer",
            ),
            "user": {
                "user_id": user.user_id,
                "full_name": user.full_name,
                "email": user.email,
                "company_id": user.company_id,
                "role_id": user.role_id,
                "registration_status": user.registration_status,
            },
        },
    }