from sqlalchemy.orm import Session
from app.models.notification import Notification


def create_notification(db: Session, user_id: int, title: str, message: str):
    """Helper to create and save a new notification for a specific user."""
    new_notif = Notification(
        user_id=user_id,
        title=title,
        message=message
    )
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)
    return new_notif


def create_notification_for_role(db: Session, company_id, role_name: str, title: str, message: str):
    """
    Create a notification for all users with a given role.
    If company_id is provided, scope to that company. Otherwise notify all users with that role.
    Uses a JOIN with Role table to avoid ORM relationship comparison errors.
    """
    from app.models.user import User
    from app.models.role import Role

    query = (
        db.query(User)
        .join(Role, User.role_id == Role.role_id)
        .filter(
            Role.role_name == role_name,
            User.is_active == True,
        )
    )

    # Only filter by company if company_id is not null
    if company_id is not None:
        query = query.filter(User.company_id == company_id)

    users = query.all()

    for user in users:
        create_notification(db, user.user_id, title, message)
