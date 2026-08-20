import os

backend_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/resource.py'
with open(backend_path, 'r', encoding='utf-8') as f:
    backend_content = f.read()

new_put = """@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource_category(category_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(ResourceCategory).filter(ResourceCategory.resource_category_id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if there are resources tied to this category
    if db.query(Resource).filter(Resource.category_id == category_id).first():
        raise HTTPException(status_code=400, detail="Cannot delete category because there are resources associated with it.")
        
    db.delete(category)
    db.commit()
    return None

@router.put("/categories/{category_id}", response_model=ResourceCategoryResponse)
def update_resource_category(category_id: int, payload: ResourceCategoryCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(ResourceCategory).filter(ResourceCategory.resource_category_id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    category.category_name = payload.category_name
    category.description = payload.description
    db.commit()
    db.refresh(category)
    return category"""

# Find the delete route to replace it + append the put
old_delete = """@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource_category(category_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(ResourceCategory).filter(ResourceCategory.resource_category_id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if there are resources tied to this category
    if db.query(Resource).filter(Resource.category_id == category_id).first():
        raise HTTPException(status_code=400, detail="Cannot delete category because there are resources associated with it.")
        
    db.delete(category)
    db.commit()
    return None"""

backend_content = backend_content.replace(old_delete, new_put)

with open(backend_path, 'w', encoding='utf-8') as f:
    f.write(backend_content)
