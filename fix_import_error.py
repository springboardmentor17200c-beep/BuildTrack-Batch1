import os

wf_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/workforce.py'
with open(wf_path, 'r', encoding='utf-8') as f:
    wf_content = f.read()

wf_content = wf_content.replace('from app.core.security import get_password_hash', 'from app.core.security import hash_password')
wf_content = wf_content.replace('password_hash=get_password_hash("12345t")', 'password_hash=hash_password("12345t")')

with open(wf_path, 'w', encoding='utf-8') as f:
    f.write(wf_content)
