import os

schema_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/schemas/project_milestone.py'
with open(schema_path, 'r', encoding='utf-8') as f:
    schema_content = f.read()

# Add to ProjectMilestoneResponse
schema_content = schema_content.replace(
    'status: str\n    created_at: datetime',
    'status: str\n    progress_percentage: int = 0\n    created_at: datetime'
)

# Add to ProjectMilestoneEnrichedResponse
schema_content = schema_content.replace(
    'completion_date: Optional[date]\n    status: str',
    'completion_date: Optional[date]\n    status: str\n    progress_percentage: int = 0'
)

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(schema_content)
