import os

schema_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/schemas/workforce.py'
with open(schema_path, 'r', encoding='utf-8') as f:
    schema_content = f.read()

old_att_create = """class AttendanceCreate(BaseModel):
    employee_id: int
    project_id: int
    attendance_date: date
    attendance_status: str             # Present | Absent | Half Day | On Leave
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    remarks: Optional[str] = None"""

new_att_create = """class AttendanceCreate(BaseModel):
    employee_id: int
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    attendance_date: date
    attendance_status: str             # Present | Absent | Half Day | On Leave
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    remarks: Optional[str] = None"""

schema_content = schema_content.replace(old_att_create, new_att_create)

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(schema_content)
