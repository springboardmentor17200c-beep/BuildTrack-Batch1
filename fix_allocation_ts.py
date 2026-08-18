import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-allocation/resource-allocation.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Remove allocatedBy from fb.group
old_group = """    this.form = this.fb.group({
      resourceId: ['', Validators.required],
      project: ['', Validators.required],
      allocatedBy: ['', Validators.required],
      allocationDate: ['', Validators.required],
      expectedReturnDate: ['', Validators.required],
    });"""

new_group = """    this.form = this.fb.group({
      resourceId: ['', Validators.required],
      project: ['', Validators.required],
      allocationDate: ['', Validators.required],
      expectedReturnDate: ['', Validators.required],
      remarks: [''],
    });"""
ts_content = ts_content.replace(old_group, new_group)

# Remove allocatedBy from submit
old_submit = """    const { resourceId, project, allocatedBy, allocationDate, expectedReturnDate } = this.form.value;
    const resource = this.availableResources.find(r => r.resourceId === resourceId);
    if (!resource) return;

    const allocation: ResourceAllocation = {
      allocationId: 'A-' + Math.floor(2000 + Math.random() * 8000),
      resourceId: resource.resourceId,
      resourceName: resource.resourceName,
      category: resource.category,
      project,
      allocatedBy,
      allocationDate,
      expectedReturnDate,
      actualReturnDate: null,
      allocationStatus: 'Allocated'
    };"""

new_submit = """    const { resourceId, project, allocationDate, expectedReturnDate, remarks } = this.form.value;
    const resource = this.availableResources.find(r => r.resourceId === resourceId);
    if (!resource) return;

    const allocation: ResourceAllocation = {
      allocationId: 'A-' + Math.floor(2000 + Math.random() * 8000),
      resourceId: resource.resourceId,
      resourceName: resource.resourceName,
      category: resource.category,
      project,
      allocatedBy: 'System', // Will be ignored by backend
      allocationDate,
      expectedReturnDate,
      actualReturnDate: null,
      allocationStatus: 'Allocated',
      remarks
    };"""
ts_content = ts_content.replace(old_submit, new_submit)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
