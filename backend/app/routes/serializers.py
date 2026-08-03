from app.models.user import User


def serialize_user(user: User) -> dict:
    return {
        "user_id": user.user_id,
        "full_name": user.full_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "company_id": user.company_id,
        "role_id": user.role_id,
        "is_active": user.is_active,
        "registration_status": user.registration_status,
        "approved_by": user.approved_by,
        "approved_at": user.approved_at,
        "created_at": user.created_at,
        "profile_image": user.profile_image,
        "role_name": user.role.role_name if user.role else None,
        "company_name": user.company.company_name if user.company else None,
    }
