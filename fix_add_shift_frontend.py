import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/workforce/workforce-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

old_add_shift = """  addShift(shift: Shift) {
    const numericEmpId = parseInt(shift.employeeId.replace('E-', ''), 10);
    const payload = {
      employee_id: numericEmpId,
      project_id: 1, // fallback
      shift_type: shift.shiftType,
      shift_date: shift.shiftDate,
      start_time: shift.startTime,
      end_time: shift.endTime,
    };"""

new_add_shift = """  addShift(shift: Shift) {
    const numericEmpId = parseInt(shift.employeeId.replace('E-', ''), 10);
    const payload = {
      employee_id: numericEmpId,
      project_name: shift.project,
      shift_type: shift.shiftType,
      shift_date: shift.shiftDate,
      start_time: shift.startTime,
      end_time: shift.endTime,
    };"""

ts_content = ts_content.replace(old_add_shift, new_add_shift)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
