import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialCategory, MaterialItem } from '../models/inventory.model';
import { InventoryDataService } from '../inventory-data.service';

interface CategorySummary {
  category: MaterialCategory;
  itemCount: number;
  lowOrOutCount: number;
}

@Component({
  selector: 'app-material-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './material-dashboard.component.html',
  styleUrls: ['./material-dashboard.component.css'],
})
export class MaterialDashboardComponent implements OnInit {
  materials: MaterialItem[] = [];
  categorySummaries: CategorySummary[] = [];

  totalMaterials = 0;
  inStockCount = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

  constructor(private data: InventoryDataService) {}

  ngOnInit(): void {
    this.data.materials$.subscribe(m => {
      this.materials = m;
      this.computeStats();
    });
  }

  private computeStats() {
    this.totalMaterials = this.materials.length;
    this.inStockCount = this.materials.filter(m => m.status === 'In Stock').length;
    this.lowStockCount = this.materials.filter(m => m.status === 'Low Stock').length;
    this.outOfStockCount = this.materials.filter(m => m.status === 'Out of Stock').length;

    const categories = Array.from(new Set(this.materials.map(m => m.category)));
    this.categorySummaries = categories.map(category => {
      const items = this.materials.filter(m => m.category === category);
      return {
        category,
        itemCount: items.length,
        lowOrOutCount: items.filter(m => m.status !== 'In Stock').length,
      };
    });
  }
}
