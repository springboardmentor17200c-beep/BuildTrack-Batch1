import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/workforce/workforce-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

old_mark_att_front = """    // Persist to backend (upsert)
    const projectNumericId = 1; // fallback; real implementation should resolve project_id from emp.project
    const payload = {
      employee_id: numericId,
      project_id: projectNumericId,
      attendance_date: date,
      attendance_status: status,
      check_in_time: (status === 'Present' || status === 'Half Day')
        ? `${date}T08:00:00` : null,
      check_out_time: null,
    };"""

new_mark_att_front = """    // Persist to backend (upsert)
    const payload = {
      employee_id: numericId,
      project_name: emp.project,
      attendance_date: date,
      attendance_status: status,
      check_in_time: (status === 'Present' || status === 'Half Day')
        ? `${date}T08:00:00` : null,
      check_out_time: null,
    };"""

ts_content = ts_content.replace(old_mark_att_front, new_mark_att_front)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
