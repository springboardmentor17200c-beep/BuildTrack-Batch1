import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

old_return = """    const numericId = parseInt(allocId, 10);"""
new_return = """    const numericId = parseInt(allocId.replace('A-', ''), 10) || parseInt(allocId, 10);"""

if old_return in ts_content:
    ts_content = ts_content.replace(old_return, new_return)
else:
    print("Could not find numericId line")

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
