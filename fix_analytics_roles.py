import os

route_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/analytics.py'
with open(route_path, 'r', encoding='utf-8') as f:
    route_content = f.read()

old_roles = 'ALL_ROLES = ("Administrator", "Project Manager")'
new_roles = 'ALL_ROLES = ("Administrator", "Project Manager", "Client", "Client / Owner", "Engineer", "Contractor", "Worker")'

if old_roles in route_content:
    route_content = route_content.replace(old_roles, new_roles)
else:
    print("Could not find old_roles")

with open(route_path, 'w', encoding='utf-8') as f:
    f.write(route_content)
