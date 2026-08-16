import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryRecord, MaterialCategory } from '../models/inventory.model';
import { InventoryDataService } from '../inventory-data.service';
import { } from '../../shared/sidebar/app-sidebar.component';


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
  records: InventoryRecord[] = [];
  categorySummaries: CategorySummary[] = [];

  totalMaterials = 0;
  inStockCount = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

  constructor(private data: InventoryDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.inventory$.subscribe(records => {
      this.records = records;
      this.computeStats();
    });
  }

  statusOf(record: InventoryRecord) {
    return this.data.getStockStatus(record);
  }

  private computeStats() {
    const statuses = this.records.map(r => this.data.getStockStatus(r));
    this.totalMaterials = this.records.length;
    this.inStockCount = statuses.filter(s => s === 'In Stock').length;
    this.lowStockCount = statuses.filter(s => s === 'Low Stock').length;
    this.outOfStockCount = statuses.filter(s => s === 'Out of Stock').length;

    const categories = Array.from(new Set(this.records.map(r => r.category)));
    this.categorySummaries = categories.map(category => {
      const items = this.records.filter(r => r.category === category);
      return {
        category,
        itemCount: items.length,
        lowOrOutCount: items.filter(r => this.data.getStockStatus(r) !== 'In Stock').length,
      };
    });
  }

  goBack(): void {
    this.location.back();
  }
}
