import os

wf_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/workforce.py'
with open(wf_path, 'r', encoding='utf-8') as f:
    wf_content = f.read()

old_create_shift = """    # Resolve project_id
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
        proj_id = db.query(Project).first().project_id"""

new_create_shift = """    # Resolve project_id
    proj_id = payload.project_id
    # Force resolve by name if project_id is 1 (dummy frontend value) or None
    if (not proj_id or proj_id == 1) and payload.project_name:
        proj = db.query(Project).filter(Project.project_name == payload.project_name).first()
        if not proj:
            proj = Project(project_name=payload.project_name, status="In Progress")
            db.add(proj)
            db.commit()
            db.refresh(proj)
        proj_id = proj.project_id
        
    if not proj_id or proj_id == 1:
        proj_id = db.query(Project).first().project_id"""

wf_content = wf_content.replace(old_create_shift, new_create_shift)

with open(wf_path, 'w', encoding='utf-8') as f:
    f.write(wf_content)
