import os

wf_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/workforce.py'
with open(wf_path, 'r', encoding='utf-8') as f:
    wf_content = f.read()

old_mark_att = """@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    emp = db.query(EmployeeProfile).filter(
        EmployeeProfile.employee_id == payload.employee_id
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")

    # Upsert: update existing record for this employee+date, or create new
    existing = db.query(Attendance).filter(
        Attendance.employee_id == payload.employee_id,
        Attendance.attendance_date == payload.attendance_date,
    ).first()

    if existing:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return _attendance_to_response(existing)

    record = Attendance(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return _attendance_to_response(record)"""

new_mark_att = """@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    emp = db.query(EmployeeProfile).filter(
        EmployeeProfile.employee_id == payload.employee_id
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")

    # Upsert: update existing record for this employee+date, or create new
    existing = db.query(Attendance).filter(
        Attendance.employee_id == payload.employee_id,
        Attendance.attendance_date == payload.attendance_date,
    ).first()

    # Resolve project_id
    proj_id = payload.project_id
    if not proj_id and payload.project_name:
        proj = db.query(Project).filter(Project.project_name == payload.project_name).first()
        if proj:
            proj_id = proj.project_id
            
    if not proj_id:
        proj_id = emp.project_id

    att_data = payload.model_dump(exclude={"project_name"})
    att_data["project_id"] = proj_id

    if existing:
        for key, value in att_data.items():
            if value is not None:
                setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return _attendance_to_response(existing)

    record = Attendance(**att_data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return _attendance_to_response(record)"""

wf_content = wf_content.replace(old_mark_att, new_mark_att)

with open(wf_path, 'w', encoding='utf-8') as f:
    f.write(wf_content)
