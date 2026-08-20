import os
import re

# 1. Update SQLAlchemy Model
model_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/models/project_milestone.py'
with open(model_path, 'r', encoding='utf-8') as f:
    model_content = f.read()

if "progress_percentage" not in model_content:
    model_content = model_content.replace(
        "status = Column(",
        "progress_percentage = Column(Integer, default=0)\n    status = Column("
    )
    with open(model_path, 'w', encoding='utf-8') as f:
        f.write(model_content)

# 2. Update Schemas
schema_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/schemas/project_milestone.py'
with open(schema_path, 'r', encoding='utf-8') as f:
    schema_content = f.read()

if "progress_percentage" not in schema_content:
    schema_content = schema_content.replace(
        "completion_date: Optional[date] = None",
        "completion_date: Optional[date] = None\n    progress_percentage: int = 0"
    )
    with open(schema_path, 'w', encoding='utf-8') as f:
        f.write(schema_content)
