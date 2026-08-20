import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/maintenance-scheduling/maintenance-scheduling.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

old_form = """    <div class="bt-form-grid">
      <label >
        <span>Equipment</span>
        <select>
          <option value="" disabled selected>Select Equipment</option>
          <option *ngFor="let res of availableResources" [value]="res.resourceId">{{ res.resourceName }}</option>
        </select>
      </label>

      <label >
        <span>Maintenance Type</span>
        <select>
          <option>Preventive</option>
          <option>Corrective</option>
        </select>
      </label>

      <div style="display: flex; gap: 16px;">
        <label style="flex: 1;">
          <span>Date</span>
          <input type="date">
        </label>
        
        <label style="flex: 1;">
          <span>Next Due Date</span>
          <input type="date">
        </label>
      </div>

      <label >
        <span>Estimated Cost (?)</span>
        <input type="number" placeholder="Enter cost">
      </label>
      
      <label >
        <span>Serviced By</span>
        <input type="text" placeholder="Service provider name">
      </label>
    </div>"""

new_form = """    <form [formGroup]="maintenanceForm" class="bt-form-grid">
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
    </form>"""

ts_content = html_content.replace(old_form, new_form)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
