import os

route_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/project.py'
with open(route_path, 'r', encoding='utf-8') as f:
    route_content = f.read()

old_roles = """    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
        )
    ),"""

new_roles = """    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Client",
            "Client / Owner",
        )
    ),"""

if old_roles in route_content:
    route_content = route_content.replace(old_roles, new_roles)
else:
    print("Could not find old_roles")

with open(route_path, 'w', encoding='utf-8') as f:
    f.write(route_content)
