import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/worker-dashboard/worker-dashboard.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

ts_content = ts_content.replace('status: a.status as any,', 'status: a.attendance_status as any,')

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
