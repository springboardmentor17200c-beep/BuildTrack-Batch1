import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/workforce/worker-dashboard/worker-dashboard.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Remove project from FormGroup
old_group = """      employeeCode: ['', Validators.required],
      workforceCategory: ['', Validators.required],
      project: ['', Validators.required],
      contact: ['', Validators.required],"""

new_group = """      employeeCode: ['', Validators.required],
      workforceCategory: ['', Validators.required],
      contact: ['', Validators.required],"""
ts_content = ts_content.replace(old_group, new_group)

# Remove project from submit
old_submit = """    const {
      fullName, employeeCode, workforceCategory, project,
      contact, experience, payRate, payType
    } = this.form.value;

    const payload: EmployeeCreatePayload = {
      full_name: fullName,
      employee_code: employeeCode,
      category_name: workforceCategory,
      project_name: project,
      contact_number: contact,
      experience_years: experience ? parseFloat(experience) : undefined,
      pay_rate: parseFloat(payRate),
      pay_type: payType,
      joining_date: new Date().toISOString().split('T')[0]
    };"""

new_submit = """    const {
      fullName, employeeCode, workforceCategory,
      contact, experience, payRate, payType
    } = this.form.value;

    const payload: EmployeeCreatePayload = {
      full_name: fullName,
      employee_code: employeeCode,
      category_name: workforceCategory,
      project_name: undefined,
      contact_number: contact,
      experience_years: experience ? parseFloat(experience) : undefined,
      pay_rate: parseFloat(payRate),
      pay_type: payType,
      joining_date: new Date().toISOString().split('T')[0]
    };"""
ts_content = ts_content.replace(old_submit, new_submit)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
