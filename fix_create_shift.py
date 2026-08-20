import os

wf_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/workforce.py'
with open(wf_path, 'r', encoding='utf-8') as f:
    wf_content = f.read()

old_create_shift = """@router.post("/shifts", response_model=ShiftResponse, status_code=status.HTTP_201_CREATED)
def create_shift(
    payload: ShiftCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*MANAGE_ROLES)),
):
    if not db.query(EmployeeProfile).filter(
        EmployeeProfile.employee_id == payload.employee_id
    ).first():
        raise HTTPException(status_code=404, detail="Employee not found.")

    shift = Shift(**payload.model_dump())
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return _shift_to_response(shift)"""

new_create_shift = """@router.post("/shifts", response_model=ShiftResponse, status_code=status.HTTP_201_CREATED)
def create_shift(
    payload: ShiftCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*MANAGE_ROLES)),
):
    if not db.query(EmployeeProfile).filter(
        EmployeeProfile.employee_id == payload.employee_id
    ).first():
        raise HTTPException(status_code=404, detail="Employee not found.")

    # Resolve project_id
    proj_id = payload.project_id
    if not proj_id and payload.project_name:
        proj = db.query(Project).filter(Project.project_name == payload.project_name).first()
        if not proj:
            proj = Project(project_name=payload.project_name, status="In Progress")
            db.add(proj)
            db.commit()
            db.refresh(proj)
        proj_id = proj.project_id
        
    if not proj_id:
        proj_id = db.query(Project).first().project_id

    shift_data = payload.model_dump(exclude={"project_name"})
    shift_data["project_id"] = proj_id

    shift = Shift(**shift_data)
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return _shift_to_response(shift)"""

wf_content = wf_content.replace(old_create_shift, new_create_shift)

with open(wf_path, 'w', encoding='utf-8') as f:
    f.write(wf_content)
