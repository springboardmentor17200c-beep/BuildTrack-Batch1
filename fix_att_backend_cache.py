import os

wf_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/workforce.py'
with open(wf_path, 'r', encoding='utf-8') as f:
    wf_content = f.read()

old_mark_att = """    # Resolve project_id
    proj_id = payload.project_id
    if not proj_id and payload.project_name:
        proj = db.query(Project).filter(Project.project_name == payload.project_name).first()
        if proj:
            proj_id = proj.project_id
            
    if not proj_id:
        proj_id = emp.project_id"""

new_mark_att = """    # Resolve project_id
    proj_id = payload.project_id
    if (not proj_id or proj_id == 1) and payload.project_name:
        proj = db.query(Project).filter(Project.project_name == payload.project_name).first()
        if proj:
            proj_id = proj.project_id
            
    if not proj_id or proj_id == 1:
        proj_id = emp.project_id"""

wf_content = wf_content.replace(old_mark_att, new_mark_att)

with open(wf_path, 'w', encoding='utf-8') as f:
    f.write(wf_content)
