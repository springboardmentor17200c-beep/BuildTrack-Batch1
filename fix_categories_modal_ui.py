import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-categories/resource-categories.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

old_form = """    <div class="bt-form-grid">
      <label >
        <span>Category Name</span>
        <input type="text" [(ngModel)]="newCategoryName" placeholder="Enter category name">
      </label>

      <label >
        <span>Description</span>
        <textarea rows="3" [(ngModel)]="newCategoryDesc" placeholder="Enter description"></textarea>
      </label>

      <label >
        <span>Status</span>
        <select>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </label>
    </div>"""

new_form = """    <div class="bt-form-grid">
      <label >
        <span>Category Name</span>
        <input type="text" [(ngModel)]="newCategoryName" placeholder="Enter category name">
      </label>

      <label >
        <span>Status</span>
        <select>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </label>

      <label style="grid-column: 1 / -1;">
        <span>Description</span>
        <textarea rows="3" [(ngModel)]="newCategoryDesc" placeholder="Enter description"></textarea>
      </label>
    </div>"""

html_content = html_content.replace(old_form, new_form)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
