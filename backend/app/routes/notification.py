from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.permissions import require_roles
from datetime import datetime

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)

# In-memory notifications database to support frontend operations (read, delete, clear) without DB tables.
MOCK_NOTIFICATIONS = [
    {
        "id": 1,
        "user_id": 1,
        "title": "Procurement Analytics",
        "message": "Purchase order PO-501 has been marked as Delivered.",
        "is_read": False,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": 2,
        "user_id": 1,
        "title": "Budget Analytics",
        "message": "Warning: Project Skyline Residency Tower has utilized 91% of its approved budget.",
        "is_read": False,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": 3,
        "user_id": 1,
        "title": "Resource Analytics",
        "message": "Ajax Concrete Mixer (R-104) is scheduled for routine engine repair maintenance.",
        "is_read": True,
        "created_at": datetime.now().isoformat()
    }
]

@router.get("")
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    return MOCK_NOTIFICATIONS

@router.put("/{id}/read")
def mark_as_read(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    for n in MOCK_NOTIFICATIONS:
        if n["id"] == id:
            n["is_read"] = True
            return n
    raise HTTPException(status_code=404, detail="Notification not found")

@router.post("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    for n in MOCK_NOTIFICATIONS:
        n["is_read"] = True
    return {"message": "All notifications marked as read"}

@router.delete("")
def delete_all(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    global MOCK_NOTIFICATIONS
    MOCK_NOTIFICATIONS.clear()
    return {"message": "All notifications deleted"}

@router.delete("/{id}")
def delete_notification(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    global MOCK_NOTIFICATIONS
    for i, n in enumerate(MOCK_NOTIFICATIONS):
        if n["id"] == id:
            MOCK_NOTIFICATIONS.pop(i)
            return {"message": "Notification deleted"}
    raise HTTPException(status_code=404, detail="Notification not found")
