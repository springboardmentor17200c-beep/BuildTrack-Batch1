import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/maintenance-scheduling/maintenance-scheduling.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Cut at <div class="bt-form-grid"> and replace everything until <div style="display: flex; justify-content: flex-end...
parts = html_content.split('<div class="bt-form-grid">')
if len(parts) > 1:
    before = parts[0]
    after = parts[1].split('<div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px;">')[1]
    
    new_form = """<form [formGroup]="maintenanceForm" class="bt-form-grid">
      <label >
        <span>Equipment</span>
        <select formControlName="resourceId">
          <option value="" disabled selected>Select Equipment</option>
          <option *ngFor="let res of availableResources" [value]="res.resourceId">{{ res.resourceName }}</option>
        </select>
      </label>

      <label >
        <span>Maintenance Type</span>
        <select formControlName="maintenanceType">
          <option value="Preventive">Preventive</option>
          <option value="Corrective">Corrective</option>
        </select>
      </label>

      <div style="display: flex; gap: 16px;">
        <label style="flex: 1;">
          <span>Date</span>
          <input type="date" formControlName="maintenanceDate">
        </label>
        
        <label style="flex: 1;">
          <span>Next Due Date</span>
          <input type="date" formControlName="nextMaintenanceDate">
        </label>
      </div>

      <label >
        <span>Estimated Cost (?)</span>
        <input type="number" placeholder="Enter cost" formControlName="maintenanceCost">
      </label>
      
      <label >
        <span>Serviced By</span>
        <input type="text" placeholder="Service provider name" formControlName="servicedBy">
      </label>
    </form>

    <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px;">"""
    
    new_html = before + new_form + after
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_html)
else:
    print("Could not split")
