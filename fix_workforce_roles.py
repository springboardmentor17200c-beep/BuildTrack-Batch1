import os

wf_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/workforce.py'
with open(wf_path, 'r', encoding='utf-8') as f:
    wf_content = f.read()

old_roles = 'ALL_ROLES = ("Administrator", "Project Manager", "Site Engineer")'
new_roles = 'ALL_ROLES = ("Administrator", "Project Manager", "Site Engineer", "Worker")'

wf_content = wf_content.replace(old_roles, new_roles)

with open(wf_path, 'w', encoding='utf-8') as f:
    f.write(wf_content)
