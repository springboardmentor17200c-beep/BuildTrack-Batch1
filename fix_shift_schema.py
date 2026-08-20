import os

schema_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/schemas/workforce.py'
with open(schema_path, 'r', encoding='utf-8') as f:
    schema_content = f.read()

old_shift_create = """class ShiftCreate(BaseModel):
    employee_id: int
    project_id: int
    shift_type: str                    # Morning | Evening | Night
    shift_date: date
    start_time: str                    # e.g. "08:00 AM"
    end_time: str"""

new_shift_create = """class ShiftCreate(BaseModel):
    employee_id: int
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    shift_type: str                    # Morning | Evening | Night
    shift_date: date
    start_time: str                    # e.g. "08:00 AM"
    end_time: str"""

schema_content = schema_content.replace(old_shift_create, new_shift_create)

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(schema_content)
