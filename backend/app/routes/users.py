from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.permissions import require_roles
from app.core.security import hash_password, verify_password
from app.db.database import get_db
from app.models.user import User
from app.routes.serializers import serialize_user
from app.schemas.auth import ChangePasswordRequest
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager")),
):
    query = db.query(User)

    if current_user.role.role_name != "Administrator":
        query = query.filter(User.company_id == current_user.company_id)

    return [serialize_user(user) for user in query.order_by(User.full_name).all()]


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return serialize_user(current_user)


@router.put("/me", response_model=UserResponse)
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

    return serialize_user(current_user)


@router.put("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    current_user.password_hash = hash_password(payload.new_password)

    db.commit()

    return {"message": "Password updated successfully."}


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)

    return serialize_user(user)
