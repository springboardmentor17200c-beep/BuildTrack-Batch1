import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-allocation/resource-allocation.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Remove filter
old_sub = "this.data.resources$.subscribe(r => (this.availableResources = r.filter(x => x.currentStatus === 'Available')));"
new_sub = "this.data.resources$.subscribe(r => (this.availableResources = r));"
ts_content = ts_content.replace(old_sub, new_sub)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
