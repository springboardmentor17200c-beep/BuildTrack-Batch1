from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse
from app.core.permissions import require_roles

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)

@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Vendor")),
):
    """Get all notifications for the current user."""
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.user_id
    ).order_by(Notification.created_at.desc()).all()
    return notifications

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Vendor")),
):
    """Mark a specific notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.user_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.post("/mark-all-read")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Vendor")),
):
    """Mark all notifications for the current user as read."""
    db.query(Notification).filter(
        Notification.user_id == current_user.user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("")
def delete_all_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Vendor")),
):
    """Delete all notifications for the current user."""
    db.query(Notification).filter(
        Notification.user_id == current_user.user_id
    ).delete()
    db.commit()
    return {"message": "All notifications deleted"}

@router.delete("/{notification_id}")
def delete_single_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Vendor")),
):
    """Delete a single notification when it is completed/clicked."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.user_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted"}
