import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-categories/resource-categories.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Fix search binding
old_search = """<input type="text" placeholder="Search category...">"""
new_search = """<input type="text" placeholder="Search category..." [(ngModel)]="searchText">"""
html_content = html_content.replace(old_search, new_search)

# Fix loop to use filteredCategories
old_loop = """<div class="bt-panel" *ngFor="let category of categories" """
new_loop = """<div class="bt-panel" *ngFor="let category of filteredCategories" """
html_content = html_content.replace(old_loop, new_loop)

# Fix edit button binding
old_edit_btn = """<button class="bt-filter-btn" style="flex: 1; justify-content: center; box-shadow: none; border-color: transparent;">Edit</button>"""
new_edit_btn = """<button class="bt-filter-btn" (click)="openModal(category)" style="flex: 1; justify-content: center; box-shadow: none; border-color: transparent;">Edit</button>"""
html_content = html_content.replace(old_edit_btn, new_edit_btn)

# Fix category.category_name placeholder label
old_label = """<span>category.category_name</span>
        <input type="text" [(ngModel)]="newCategoryName" placeholder="Enter category.category_name">"""
new_label = """<span>Category Name</span>
        <input type="text" [(ngModel)]="newCategoryName" placeholder="Enter category name">"""
html_content = html_content.replace(old_label, new_label)

# Fix Add Category title
old_title = """<h3 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--bt-text);">Add Resource Category</h3>"""
new_title = """<h3 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--bt-text);">{{ editCategoryId ? 'Edit' : 'Add' }} Resource Category</h3>"""
html_content = html_content.replace(old_title, new_title)

# Fix Add/Save button text
old_save_btn = """<button class="bt-add-btn" (click)="saveCategory()">Save Category</button>"""
new_save_btn = """<button class="bt-add-btn" (click)="saveCategory()">{{ editCategoryId ? 'Update' : 'Save' }} Category</button>"""
html_content = html_content.replace(old_save_btn, new_save_btn)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
