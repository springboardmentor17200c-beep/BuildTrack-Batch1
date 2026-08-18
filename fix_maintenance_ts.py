import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/maintenance-scheduling/maintenance-scheduling.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Add imports
ts_content = ts_content.replace(
    "import { FormsModule } from '@angular/forms';",
    "import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';"
)

ts_content = ts_content.replace(
    "imports: [CommonModule, FormsModule],",
    "imports: [CommonModule, FormsModule, ReactiveFormsModule],"
)

# Add form variable
ts_content = ts_content.replace(
    "  private sub?: Subscription;",
    "  private sub?: Subscription;\n  maintenanceForm!: FormGroup;"
)

# Modify constructor
old_constructor = """  constructor(
    private location: Location,
    private resourceData: ResourceDataService
  ) {}"""

new_constructor = """  constructor(
    private location: Location,
    private resourceData: ResourceDataService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  private initForm() {
    this.maintenanceForm = this.fb.group({
      resourceId: ['', Validators.required],
      maintenanceType: ['Preventive', Validators.required],
      maintenanceDate: ['', Validators.required],
      nextMaintenanceDate: [''],
      maintenanceCost: [0, Validators.min(0)],
      servicedBy: ['', Validators.required],
      remarks: ['']
    });
  }"""

ts_content = ts_content.replace(old_constructor, new_constructor)

# Modify scheduleMaintenance and saveMaintenance
old_methods = """  scheduleMaintenance() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveMaintenance() {
    this.closeModal();
  }"""

new_methods = """  scheduleMaintenance() {
    this.initForm();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveMaintenance() {
    if (this.maintenanceForm.invalid) {
      alert("Please fill out all required fields.");
      return;
    }
    this.resourceData.addMaintenance(this.maintenanceForm.value);
    this.closeModal();
  }"""

ts_content = ts_content.replace(old_methods, new_methods)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
