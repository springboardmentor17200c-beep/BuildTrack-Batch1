import os
import re

### 1. Fix Backend Data Isolation in project.py ###
project_routes_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/project.py'
with open(project_routes_path, 'r', encoding='utf-8') as f:
    proj_content = f.read()

# For get_projects_enriched
enrich_pattern = r"def get_projects_enriched\(\s*db: Session = Depends\(get_db\),\s*current_user=Depends\(require_roles\(\*ALL_ROLES\)\),\s*\):\s*projects = db\.query\(Project\)\.all\(\)"
enrich_replacement = """def get_projects_enriched(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    query = db.query(Project)
    if current_user.role and current_user.role.role_name == "Project Manager":
        query = query.filter(Project.manager_id == current_user.user_id)
    elif current_user.role and current_user.role.role_name in ("Client", "Client / Owner"):
        query = query.filter(Project.client_id == current_user.user_id)
    projects = query.all()"""
proj_content = re.sub(enrich_pattern, enrich_replacement, proj_content)

# For get_projects
get_pattern = r"def get_projects\(\s*db: Session = Depends\(get_db\),\s*current_user=Depends\(require_roles\(\"Administrator\", \"Project Manager\"\)\),\s*\):\s*return db\.query\(Project\)\.all\(\)"
get_replacement = """def get_projects(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager")),
):
    query = db.query(Project)
    if current_user.role and current_user.role.role_name == "Project Manager":
        query = query.filter(Project.manager_id == current_user.user_id)
    return query.all()"""
proj_content = re.sub(get_pattern, get_replacement, proj_content)

with open(project_routes_path, 'w', encoding='utf-8') as f:
    f.write(proj_content)


### 2. Fix Backend Data Isolation in analytics.py ###
analytics_routes_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/analytics.py'
with open(analytics_routes_path, 'r', encoding='utf-8') as f:
    analytics_content = f.read()

prog_pattern = r"def get_progress_analytics\(\s*db: Session = Depends\(get_db\),\s*current_user=Depends\(require_roles\(\*ALL_ROLES\)\),\s*\):\s*\"\"\"Project progress: completion % derived from milestones per project\.\"\"\"\s*projects = db\.query\(Project\)\.all\(\)"
prog_replacement = """def get_progress_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    \"\"\"Project progress: completion % derived from milestones per project.\"\"\"
    query = db.query(Project)
    if current_user.role and current_user.role.role_name == "Project Manager":
        query = query.filter(Project.manager_id == current_user.user_id)
    elif current_user.role and current_user.role.role_name in ("Client", "Client / Owner"):
        query = query.filter(Project.client_id == current_user.user_id)
    projects = query.all()"""
analytics_content = re.sub(prog_pattern, prog_replacement, analytics_content)

with open(analytics_routes_path, 'w', encoding='utf-8') as f:
    f.write(analytics_content)


### 3. Fix Frontend Project Creation Manager ID Bug ###
ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/project-listing/project-listing.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Change string[] to {id, name}[]
ts_content = ts_content.replace(
    "availableManagers: string[] = [];\n  availableClients: string[] = [];",
    "availableManagers: {id: number, name: string}[] = [];\n  availableClients: {id: number, name: string}[] = [];"
)

# Update the map function
ts_content = ts_content.replace(
    "this.availableManagers = users.filter(u => u.role === 'Project Manager').map(u => u.fullName || u.username);",
    "this.availableManagers = users.filter(u => u.role === 'Project Manager').map(u => ({ id: parseInt(u.userId), name: u.fullName || u.username }));"
)
ts_content = ts_content.replace(
    "this.availableClients = users.filter(u => u.role === 'Client / Owner').map(u => u.fullName || u.companyName || u.username);",
    "this.availableClients = users.filter(u => u.role === 'Client / Owner' || u.role === ('Client' as any)).map(u => ({ id: parseInt(u.userId), name: u.fullName || u.companyName || u.username }));"
)

# Fix the hardcoded managerId and clientId in the payload
payload_pattern = r"managerId,\s*clientId: managerId,"
payload_replacement = "managerId: parseInt(this.form.value.manager, 10),\n        clientId: parseInt(this.form.value.client, 10),"
ts_content = re.sub(payload_pattern, payload_replacement, ts_content)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

### 4. Fix Frontend HTML mapping ###
html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/project-listing/project-listing.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

html_content = html_content.replace(
    '<option *ngFor="let m of availableManagers" [value]="m">{{ m }}</option>',
    '<option *ngFor="let m of availableManagers" [value]="m.id">{{ m.name }}</option>'
)
html_content = html_content.replace(
    '<option *ngFor="let c of availableClients" [value]="c">{{ c }}</option>',
    '<option *ngFor="let c of availableClients" [value]="c.id">{{ c.name }}</option>'
)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
