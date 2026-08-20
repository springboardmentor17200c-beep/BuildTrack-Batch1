import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-categories/resource-categories.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

old_save = """    if (this.editCategoryId) {
      // Fake PUT since we don't have one in backend
      alert('Edit functionality requires a backend update. Coming soon!');
      this.closeModal();
      return;
    }

    this.http.post(`${environment.apiUrl}/resources/categories`, payload, this.headers)
      .subscribe({"""

new_save = """    if (this.editCategoryId) {
      this.http.put(`${environment.apiUrl}/resources/categories/${this.editCategoryId}`, payload, this.headers)
        .subscribe({
          next: () => {
            this.loadCategories();
            this.closeModal();
          },
          error: (err) => {
            console.error('Error updating category', err);
            alert('Failed to update category.');
          }
        });
      return;
    }

    this.http.post(`${environment.apiUrl}/resources/categories`, payload, this.headers)
      .subscribe({"""

ts_content = ts_content.replace(old_save, new_save)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
