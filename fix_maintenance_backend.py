import os

route_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/resource.py'
with open(route_path, 'r', encoding='utf-8') as f:
    route_content = f.read()

new_maintenance = """# --- Maintenance Records ---

@router.post("/maintenance", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_maintenance_record(payload: MaintenanceRecordCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    maintenance = MaintenanceRecord(
        resource_id=payload.resource_id,
        maintenance_type=payload.maintenance_type,
        maintenance_date=payload.maintenance_date,
        next_maintenance_date=payload.next_maintenance_date,
        maintenance_cost=payload.maintenance_cost,
        serviced_by=payload.serviced_by,
        remarks=payload.remarks
    )
    db.add(maintenance)
    
    # Optionally update resource status to "Under Maintenance"
    if payload.maintenance_type == 'Corrective':
        resource = db.query(Resource).filter(Resource.resource_id == payload.resource_id).first()
        if resource:
            resource.current_status = 'Under Maintenance'
            
    db.commit()
    db.refresh(maintenance)
    return {"maintenance_id": maintenance.maintenance_id}

"""

route_content = route_content.replace("# --- Maintenance Records ---", new_maintenance)

with open(route_path, 'w', encoding='utf-8') as f:
    f.write(route_content)
