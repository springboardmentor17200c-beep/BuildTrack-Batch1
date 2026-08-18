import os
import re

# 1. Update resource-allocation.component.ts
ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-allocation/resource-allocation.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts = f.read()

# Add ProjectsDataService import
ts = ts.replace("import { ResourceDataService } from '../resource-data.service';", 
                "import { ResourceDataService } from '../resource-data.service';\nimport { ProjectsDataService } from '../../projects/projects-data.service';")

# Inject ProjectsDataService
ts = ts.replace("constructor(private data: ResourceDataService, private fb: FormBuilder, private location: Location)",
                "constructor(private data: ResourceDataService, private projectsData: ProjectsDataService, private fb: FormBuilder, private location: Location)")

# Replace this.projectNames assignment
ts = ts.replace("this.projectNames = this.data.projectNames;",
                "this.projectsData.projects$.subscribe(p => this.projectNames = p.map(x => x.projectName));")

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts)


# 2. Update maintenance-scheduling.component.ts
ts2_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/maintenance-scheduling/maintenance-scheduling.component.ts'
with open(ts2_path, 'r', encoding='utf-8') as f:
    ts2 = f.read()

ts2 = ts2.replace("import { MaintenanceRecord } from '../models/resource.model';", 
                  "import { MaintenanceRecord, Resource } from '../models/resource.model';")

ts2 = ts2.replace("allRecords: MaintenanceRecord[] = [];", 
                  "allRecords: MaintenanceRecord[] = [];\n  availableResources: Resource[] = [];")

ts2 = ts2.replace("this.allRecords = records;\n    });", 
                  "this.allRecords = records;\n    });\n    this.resourceData.resources$.subscribe(r => this.availableResources = r);")

with open(ts2_path, 'w', encoding='utf-8') as f:
    f.write(ts2)


# 3. Update maintenance-scheduling.component.html
html2_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/maintenance-scheduling/maintenance-scheduling.component.html'
with open(html2_path, 'r', encoding='utf-8') as f:
    html2 = f.read()

html2 = re.sub(
    r'<select>\s*<option>Select Equipment</option>\s*<option>CAT 320 Excavator</option>\s*<option>Tower Crane TC-02</option>\s*</select>',
    '<select>\n          <option value="" disabled selected>Select Equipment</option>\n          <option *ngFor="let res of availableResources" [value]="res.resourceId">{{ res.resourceName }}</option>\n        </select>',
    html2
)

with open(html2_path, 'w', encoding='utf-8') as f:
    f.write(html2)
