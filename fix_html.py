import os
import re

# 1. Update maintenance-scheduling.component.html
html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/maintenance-scheduling/maintenance-scheduling.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('r.resourceName || r.resource', 'r.resourceName')
html = html.replace('r.type || r.maintenanceType', 'r.maintenanceType')
html = html.replace('r.nextDate || r.nextMaintenanceDate', 'r.nextMaintenanceDate')
html = html.replace('r.cost || r.maintenanceCost', 'r.maintenanceCost')
html = html.replace("r.status || 'Completed'", "'Completed'")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Update models/resource.model.ts to use ResourceStatus
model_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/models/resource.model.ts'
with open(model_path, 'r', encoding='utf-8') as f:
    model = f.read()

model = model.replace('currentStatus: string;', 'currentStatus: ResourceStatus;')
model = model.replace('allocationStatus: string;', 'allocationStatus: AllocationStatus;')

with open(model_path, 'w', encoding='utf-8') as f:
    f.write(model)

