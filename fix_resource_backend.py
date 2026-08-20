import os
import re

route_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/resource.py'
with open(route_path, 'r', encoding='utf-8') as f:
    route_content = f.read()

new_routes = """
@router.post("/allocations", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_resource_allocation(payload: ResourceAllocationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    allocation = ResourceAllocation(
        resource_id=payload.resource_id,
        project_id=payload.project_id,
        allocated_by_id=current_user.user_id,
        allocation_date=payload.allocation_date,
        expected_return_date=payload.expected_return_date,
        allocation_status="Allocated",
        remarks=payload.remarks
    )
    db.add(allocation)
    db.commit()
    db.refresh(allocation)
    return {"allocation_id": allocation.allocation_id}

@router.put("/allocations/{allocation_id}", response_model=dict)
def update_resource_allocation(allocation_id: int, payload: ResourceAllocationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    allocation = db.query(ResourceAllocation).filter(ResourceAllocation.allocation_id == allocation_id).first()
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found.")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(allocation, key, value)
        
    db.commit()
    return {"allocation_id": allocation.allocation_id}

# --- Maintenance Records ---"""

route_content = route_content.replace("# --- Maintenance Records ---", new_routes)

with open(route_path, 'w', encoding='utf-8') as f:
    f.write(route_content)
