from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.resource import ResourceCategory, Resource
from app.schemas.resource import (
    ResourceCategoryCreate,
    ResourceCategoryResponse,
    ResourceCategoryUpdate,
    ResourceCreate,
    ResourceResponse,
    ResourceUpdate
)

router = APIRouter(
    prefix="/resources",
    tags=["Resources"],
)

# --- Resource Categories ---

@router.get("/categories", response_model=list[dict])
def get_resource_categories(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Retrieve all resource categories with resource counts."""
    categories = db.query(ResourceCategory).all()
    result = []
    for cat in categories:
        count = db.query(Resource).filter(Resource.resource_category_id == cat.resource_category_id).count()
        result.append({
            "resource_category_id": cat.resource_category_id,
            "category_name": cat.category_name,
            "description": cat.description,
            "resources": count,
            "status": "Active" # Mock status for now as DB model doesn't have it
        })
    return result

@router.post("/categories", response_model=ResourceCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_resource_category(payload: ResourceCategoryCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    duplicate = db.query(ResourceCategory).filter(ResourceCategory.category_name == payload.category_name).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Resource category already exists.")
    category = ResourceCategory(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource_category(category_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(ResourceCategory).filter(ResourceCategory.resource_category_id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
    
    count = db.query(Resource).filter(Resource.resource_category_id == category_id).count()
    if count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category with associated resources.")
        
    db.delete(category)
    db.commit()

# --- Resources ---

@router.get("", response_model=list[ResourceResponse])
def get_resources(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Resource).all()

