import os
import re

service_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-data.service.ts'
with open(service_path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("from '../../../../environments/environment';", "from '../../../environments/environment';")
text = text.replace("allocationStatus: 'Returned'", "allocationStatus: 'Returned' as any")
text = text.replace("currentStatus: r.current_status", "currentStatus: r.current_status as any")
text = text.replace("allocationStatus: a.allocation_status || 'Allocated'", "allocationStatus: a.allocation_status as any || 'Allocated'")

with open(service_path, 'w', encoding='utf-8') as f:
    f.write(text)
