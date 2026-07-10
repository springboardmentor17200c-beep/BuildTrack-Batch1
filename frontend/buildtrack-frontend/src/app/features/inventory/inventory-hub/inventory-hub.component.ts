import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { InventoryDataService } from '../inventory-data.service';

interface InventoryOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  accent: string;
  stat: string;
  statLabel: string;
}

@Component({
  selector: 'app-inventory-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inventory-hub.component.html',
  styleUrls: ['./inventory-hub.component.css'],
})
export class InventoryHubComponent implements OnInit {
  totalMaterials = 0;
  inStockCount = 0;
  lowStockCount = 0;
  outOfStockCount = 0;
  pendingRequests = 0;

  options: InventoryOption[] = [
    {
      title: 'Material Inventory Dashboard',
      description: 'Overview of all materials in stock, categorized, with stock health at a glance.',
      icon: 'dashboard',
      route: 'dashboard',
      accent: 'blue',
      stat: '13',
      statLabel: 'Tracked materials',
    },
    {
      title: 'Stock Monitoring',
      description: 'Track stock levels per site, spot low or out-of-stock items before they cause delays.',
      icon: 'monitoring',
      route: 'stock',
      accent: 'orange',
      stat: '5',
      statLabel: 'Low / out of stock',
    },
    {
      title: 'Procurement Requests',
      description: 'Raise, approve and track material requests from sites to procurement.',
      icon: 'requests',
      route: 'requests',
      accent: 'purple',
      stat: '4',
      statLabel: 'Open requests',
    },
  ];

  constructor(private router: Router, private data: InventoryDataService) {}

  ngOnInit(): void {
    this.data.materials$.subscribe(materials => {
      this.totalMaterials = materials.length;
      this.inStockCount = materials.filter(m => m.status === 'In Stock').length;
      this.lowStockCount = materials.filter(m => m.status === 'Low Stock').length;
      this.outOfStockCount = materials.filter(m => m.status === 'Out of Stock').length;
    });
    this.data.requests$.subscribe(requests => {
      this.pendingRequests = requests.filter(r => r.status === 'Pending').length;
    });
  }

  open(route: string) {
    this.router.navigate(['/inventory', route]);
  }
}
