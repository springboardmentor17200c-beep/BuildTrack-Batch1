import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryRecord, MaterialCategory, StockStatus } from '../models/inventory.model';
import { InventoryDataService } from '../inventory-data.service';

@Component({
  selector: 'app-stock-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './stock-monitoring.component.html',
  styleUrls: ['./stock-monitoring.component.css'],
})
export class StockMonitoringComponent implements OnInit {
  allRecords: InventoryRecord[] = [];
  search = '';
  categoryFilter: MaterialCategory | 'All' = 'All';
  statusFilter: StockStatus | 'All' = 'All';

  categories: (MaterialCategory | 'All')[] = [
    'All', 'Cement', 'Steel', 'Bricks', 'Sand', 'Concrete', 'Electrical Materials', 'Plumbing Materials',
  ];
  statuses: (StockStatus | 'All')[] = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  constructor(private data: InventoryDataService) {}

  ngOnInit(): void {
    this.data.inventory$.subscribe(r => (this.allRecords = r));
  }

  statusOf(record: InventoryRecord) {
    return this.data.getStockStatus(record);
  }

  get filtered(): InventoryRecord[] {
    return this.allRecords.filter(r => {
      const matchesSearch =
        !this.search ||
        r.materialName.toLowerCase().includes(this.search.toLowerCase()) ||
        r.materialId.toLowerCase().includes(this.search.toLowerCase());
      const matchesCategory = this.categoryFilter === 'All' || r.category === this.categoryFilter;
      const matchesStatus = this.statusFilter === 'All' || this.statusOf(r) === this.statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  stockPercent(m: InventoryRecord): number {
    const pct = (m.availableQuantity / (m.minimumStockLevel * 2)) * 100;
    return Math.max(2, Math.min(100, Math.round(pct)));
  }
}
