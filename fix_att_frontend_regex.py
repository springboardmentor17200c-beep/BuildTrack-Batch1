import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/workforce/workforce-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

import re
ts_content = re.sub(
    r'const projectNumericId = 1;\s*// fallback.*?const payload = \{.*?employee_id: numericId,.*?project_id: projectNumericId,.*?attendance_date: date,.*?attendance_status: status,.*?check_in_time: .*?\?.*? \: null,\s*\};',
    r'''const payload = {
      employee_id: numericId,
      project_name: emp.project,
      attendance_date: date,
      attendance_status: status,
      check_in_time: (status === 'Present' || status === 'Half Day')
        ? `${date}T08:00:00` : null,
    };''',
    ts_content,
    flags=re.DOTALL
)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
