import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ResourceCategory {
  resource_category_id?: number;
  category_name: string;
  description: string;
  resources: number;
  status: string;
}

@Component({
  selector: 'app-resource-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-categories.component.html',
  styleUrls: ['./resource-categories.component.css']
})
export class ResourceCategoriesComponent implements OnInit {

  showModal = false;
  categories: ResourceCategory[] = [];
  
  // Form fields
  newCategoryName = '';
  newCategoryDesc = '';

  constructor(private location: Location, private http: HttpClient) {}

  ngOnInit() {
    this.loadCategories();
  }

  private get headers() {
    const token = localStorage.getItem('buildtrack_access_token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  loadCategories() {
    this.http.get<any[]>(`${environment.apiUrl}/resources/categories`, this.headers)
      .subscribe({
        next: (data) => {
          this.categories = data.map(item => ({
            resource_category_id: item.resource_category_id,
            name: item.category_name,
            description: item.description || '',
            resources: item.resources || 0,
            status: item.status || 'Active'
          }));
        },
        error: (err) => console.error('Error loading categories', err)
      });
  }

  goBack(): void {
    this.location.back();
  }

  openModal() {
    this.newCategoryName = '';
    this.newCategoryDesc = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCategory() {
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
  }

  deleteCategory(id?: number) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.http.delete(`${environment.apiUrl}/resources/categories/${id}`, this.headers)
      .subscribe({
        next: () => this.loadCategories(),
        error: (err) => {
          console.error('Error deleting category', err);
          alert('Cannot delete category because it has associated resources.');
        }
      });
  }
}
