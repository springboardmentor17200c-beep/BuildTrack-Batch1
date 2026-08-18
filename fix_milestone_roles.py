import os
import re

route_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/project_milestone.py'
with open(route_path, 'r', encoding='utf-8') as f:
    route_content = f.read()

old_roles = 'ALL_ROLES = ("Administrator", "Project Manager", "Site Engineer")'
new_roles = 'ALL_ROLES = ("Administrator", "Project Manager", "Site Engineer", "Client", "Client / Owner", "Vendor", "Contractor", "Worker")'

route_content = route_content.replace(old_roles, new_roles)

# Replace hardcoded require_roles
hardcoded1 = """        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )"""

route_content = route_content.replace(hardcoded1, "require_roles(*ALL_ROLES)")

with open(route_path, 'w', encoding='utf-8') as f:
    f.write(route_content)
