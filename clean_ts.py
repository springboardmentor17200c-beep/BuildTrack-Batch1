import os
import re

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Cut everything from the first "addMaintenance" onwards and then append a clean version
clean_content = ts_content.split('addMaintenance(')[0]

clean_content += """addMaintenance(record: Partial<MaintenanceRecord>) {
    const numResourceId = parseInt((record.resourceId || '').replace('R-', ''), 10) || parseInt(record.resourceId || '0', 10);
    const body = {
      resource_id: numResourceId,
      maintenance_type: record.maintenanceType,
      maintenance_date: record.maintenanceDate,
      next_maintenance_date: record.nextMaintenanceDate || null,
      maintenance_cost: record.maintenanceCost || 0,
      serviced_by: record.servicedBy || 'Unknown',
      remarks: record.remarks || ''
    };

    this.http.post(`${environment.apiUrl}/resources/maintenance`, body, this.headers).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Failed to add maintenance', err)
    });
  }
}"""

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(clean_content)
