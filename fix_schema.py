import os

schema_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/schemas/project_milestone.py'
with open(schema_path, 'r', encoding='utf-8') as f:
    schema_content = f.read()

schema_content = schema_content.replace(
    'status: str = "Pending"',
    'status: str = "Pending"\n    progress_percentage: int = 0'
)

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(schema_content)
