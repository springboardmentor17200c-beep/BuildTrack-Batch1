import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-allocation/resource-allocation.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

old_form = """      <div class="bt-form-grid">
        <label>
          <span>Resource</span>
          <select formControlName="resourceId">
            <option value="" disabled selected>Select available resource</option>
            <option *ngFor="let r of availableResources" [value]="r.resourceId">{{ r.resourceName }} ({{ r.category }})</option>
          </select>
        </label>
        <label>
          <span>Project</span>
          <select formControlName="project">
            <option value="" disabled selected>Select project</option>
            <option *ngFor="let p of projectNames" [value]="p">{{ p }}</option>
          </select>
        </label>
        <label>
          <span>Allocated By</span>
          <input type="text" formControlName="allocatedBy" placeholder="e.g. Priya Menon" />
        </label>
        <label>
          <span>Allocation Date</span>
          <input type="date" formControlName="allocationDate" />
        </label>
        <label>
          <span>Expected Return Date</span>
          <input type="date" formControlName="expectedReturnDate" />
        </label>
      </div>"""

new_form = """      <div class="bt-form-grid">
        <label>
          <span>Resource</span>
          <select formControlName="resourceId">
            <option value="" disabled selected>Select available resource</option>
            <option *ngFor="let r of availableResources" [value]="r.resourceId">{{ r.resourceName }} ({{ r.category }})</option>
          </select>
        </label>
        <label>
          <span>Project</span>
          <select formControlName="project">
            <option value="" disabled selected>Select project</option>
            <option *ngFor="let p of projectNames" [value]="p">{{ p }}</option>
          </select>
        </label>
        <label>
          <span>Allocation Date</span>
          <input type="date" formControlName="allocationDate" />
        </label>
        <label>
          <span>Expected Return Date</span>
          <input type="date" formControlName="expectedReturnDate" />
        </label>
        <label style="grid-column: 1 / -1;">
          <span>Remarks</span>
          <input type="text" formControlName="remarks" placeholder="Optional notes about this allocation" />
        </label>
      </div>"""
      
html_content = html_content.replace(old_form, new_form)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
