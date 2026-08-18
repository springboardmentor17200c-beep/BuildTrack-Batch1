import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/project-listing/project-listing.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts = f.read()

# Add manager and client to FormGroup
ts = ts.replace(
    "expectedEndDate: ['', Validators.required],",
    "expectedEndDate: ['', Validators.required],\n      manager:         ['', Validators.required],\n      client:          ['', Validators.required],"
)

# Use form values for manager and client
ts = ts.replace("managerName:     user.fullName,", "managerName:     this.form.value.manager,")
ts = ts.replace("clientName:      user.fullName,", "clientName:      this.form.value.client,")

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts)
