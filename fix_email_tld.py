import os

wf_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/workforce.py'
with open(wf_path, 'r', encoding='utf-8') as f:
    wf_content = f.read()

wf_content = wf_content.replace('payload.employee_code}@buildtrack.local', 'payload.employee_code}@buildtrack.com')

with open(wf_path, 'w', encoding='utf-8') as f:
    f.write(wf_content)
