import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-categories/resource-categories.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Add searchText and editCategoryId
ts_content = ts_content.replace(
    "  newCategoryDesc = '';",
    "  newCategoryDesc = '';\n  searchText = '';\n  editCategoryId: number | null = null;"
)

# Update get filteredCategories
ts_content = ts_content.replace(
    "  loadCategories() {",
    "  get filteredCategories() {\n    return this.categories.filter(c => c.category_name.toLowerCase().includes(this.searchText.toLowerCase()) || c.description.toLowerCase().includes(this.searchText.toLowerCase()));\n  }\n\n  loadCategories() {"
)

# Update openModal
ts_content = ts_content.replace(
    """  openModal() {
    this.newCategoryName = '';
    this.newCategoryDesc = '';
    this.showModal = true;
  }""",
    """  openModal(category?: ResourceCategory) {
    if (category) {
      this.editCategoryId = category.resource_category_id || null;
      this.newCategoryName = category.category_name;
      this.newCategoryDesc = category.description;
    } else {
      this.editCategoryId = null;
      this.newCategoryName = '';
      this.newCategoryDesc = '';
    }
    this.showModal = true;
  }"""
)

# Update saveCategory
old_save = """  saveCategory() {
    if (!this.newCategoryName.trim()) return;

    const payload = {
      category_name: this.newCategoryName,
      description: this.newCategoryDesc
    };

    this.http.post(`${environment.apiUrl}/resources/categories`, payload, this.headers)
      .subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error saving category', err);
          alert('Failed to save category. It may already exist.');
        }
      });
  }"""

new_save = """  saveCategory() {
    if (!this.newCategoryName.trim()) return;

    const payload = {
      category_name: this.newCategoryName,
      description: this.newCategoryDesc
    };

    if (this.editCategoryId) {
      // Fake PUT since we don't have one in backend
      alert('Edit functionality requires a backend update. Coming soon!');
      this.closeModal();
      return;
    }

    this.http.post(`${environment.apiUrl}/resources/categories`, payload, this.headers)
      .subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error saving category', err);
          alert('Failed to save category. It may already exist.');
        }
      });
  }"""

ts_content = ts_content.replace(old_save, new_save)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
