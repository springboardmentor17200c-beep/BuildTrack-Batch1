import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialCategory, MaterialItem, StockStatus } from '../models/inventory.model';
import { InventoryDataService } from '../inventory-data.service';

@Component({
  selector: 'app-stock-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './stock-monitoring.component.html',
  styleUrls: ['./stock-monitoring.component.css'],
})
export class StockMonitoringComponent implements OnInit {
  allMaterials: MaterialItem[] = [];
  search = '';
  categoryFilter: MaterialCategory | 'All' = 'All';
  statusFilter: StockStatus | 'All' = 'All';

  categories: (MaterialCategory | 'All')[] = [
    'All', 'Cement', 'Steel', 'Bricks', 'Sand', 'Concrete', 'Electrical Materials', 'Plumbing Materials',
  ];
  statuses: (StockStatus | 'All')[] = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  constructor(private data: InventoryDataService) {}

  ngOnInit(): void {
    this.data.materials$.subscribe(m => (this.allMaterials = m));
  }

  get filtered(): MaterialItem[] {
    return this.allMaterials.filter(m => {
      const matchesSearch =
        !this.search ||
        m.name.toLowerCase().includes(this.search.toLowerCase()) ||
        m.id.toLowerCase().includes(this.search.toLowerCase());
      const matchesCategory = this.categoryFilter === 'All' || m.category === this.categoryFilter;
      const matchesStatus = this.statusFilter === 'All' || m.status === this.statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  stockPercent(m: MaterialItem): number {
    const pct = (m.currentStock / (m.reorderLevel * 2)) * 100;
    return Math.max(2, Math.min(100, Math.round(pct)));
  }

  statusClass(status: StockStatus) {
    return {
      'In Stock': 'badge green',
      'Low Stock': 'badge orange',
      'Out of Stock': 'badge red',
    }[status];
  }
}
