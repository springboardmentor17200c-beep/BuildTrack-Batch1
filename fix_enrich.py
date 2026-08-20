import os

route_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/project_milestone.py'
with open(route_path, 'r', encoding='utf-8') as f:
    route_content = f.read()

old_enrich = """        due_date=m.due_date,
        completion_date=m.completion_date,
        status=m.status,
    )"""

new_enrich = """        due_date=m.due_date,
        completion_date=m.completion_date,
        status=m.status,
        progress_percentage=m.progress_percentage,
    )"""

route_content = route_content.replace(old_enrich, new_enrich)

with open(route_path, 'w', encoding='utf-8') as f:
    f.write(route_content)
