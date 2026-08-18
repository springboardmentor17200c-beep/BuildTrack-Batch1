import os

wf_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/workforce.py'
with open(wf_path, 'r', encoding='utf-8') as f:
    wf_content = f.read()

old_proj_logic = """    # Resolve or create Project
    proj_id = payload.project_id
    if not proj_id and payload.project_name:
        proj = db.query(Project).filter(Project.project_name == payload.project_name).first()
        if not proj:
            proj = Project(project_name=payload.project_name, status="Planning")
            db.add(proj)
            db.commit()
            db.refresh(proj)
        proj_id = proj.project_id"""

new_proj_logic = """    # Resolve or create Project
    proj_id = payload.project_id
    if not proj_id and payload.project_name:
        proj = db.query(Project).filter(Project.project_name == payload.project_name).first()
        if not proj:
            proj = Project(project_name=payload.project_name, status="Planning")
            db.add(proj)
            db.commit()
            db.refresh(proj)
        proj_id = proj.project_id
        
    # Provide a default project if none was selected (since it's a required field in DB)
    if not proj_id:
        first_proj = db.query(Project).first()
        if first_proj:
            proj_id = first_proj.project_id
        else:
            proj = Project(project_name="General Assignments", status="In Progress")
            db.add(proj)
            db.commit()
            db.refresh(proj)
            proj_id = proj.project_id"""

wf_content = wf_content.replace(old_proj_logic, new_proj_logic)

with open(wf_path, 'w', encoding='utf-8') as f:
    f.write(wf_content)
