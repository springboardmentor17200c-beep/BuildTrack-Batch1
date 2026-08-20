import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { InventoryDataService } from '../inventory-data.service';
import { Subscription } from 'rxjs';
import { } from '../../shared/sidebar/app-sidebar.component';


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
export class InventoryHubComponent implements OnInit, OnDestroy {
  totalMaterials = 0;
  inStockCount = 0;
  lowStockCount = 0;
  outOfStockCount = 0;
  pendingRequests = 0;
  activeAllocations = 0;

  options: InventoryOption[] = [
    {
      title: 'Material Inventory Dashboard',
      description: 'Overview of all materials in stock, categorized, with stock health at a glance.',
      icon: 'dashboard',
      route: 'dashboard',
      accent: 'blue',
      stat: '0',
      statLabel: 'Tracked materials',
    },
    {
      title: 'Stock Monitoring',
      description: 'Track stock levels per site, spot low or out-of-stock items before they cause delays.',
      icon: 'monitoring',
      route: 'stock',
      accent: 'orange',
      stat: '0',
      statLabel: 'Low / out of stock',
    },
    {
      title: 'Material Requests',
      description: 'Projects request material from stock — approving issues it out and reduces inventory.',
      icon: 'requests',
      route: 'requests',
      accent: 'purple',
      stat: '0',
      statLabel: 'Open requests',
    },
    {
      title: 'Material Allocation',
      description: 'Reserve and allocate materials to specific projects. Track issued and returned items.',
      icon: 'allocation',
      route: 'allocation',
      accent: 'green',
      stat: '0',
      statLabel: 'Active allocations',
    },
    {
      title: 'Stock Management',
      description: 'Manage materials catalog, add new items, edit existing ones, and adjust stock levels.',
      icon: 'management',
      route: 'management',
      accent: 'teal',
      stat: '0',
      statLabel: 'Materials managed',
    }
  ];

  private subscriptions = new Subscription();

  constructor(private router: Router, private data: InventoryDataService, private location: Location) {}

  ngOnInit(): void {
    // Subscribe to inventory updates
    this.subscriptions.add(
      this.data.inventory$.subscribe(records => {
        this.totalMaterials = records.length;
        const statuses = records.map(r => this.data.getStockStatus(r));
        this.inStockCount = statuses.filter(s => s === 'In Stock').length;
        this.lowStockCount = statuses.filter(s => s === 'Low Stock').length;
        this.outOfStockCount = statuses.filter(s => s === 'Out of Stock').length;
        this.updateOptionStats();
      })
    );

    // Subscribe to requests updates
    this.subscriptions.add(
      this.data.requests$.subscribe(requests => {
        this.pendingRequests = requests.filter(r => r.requestStatus === 'Pending').length;
        this.updateOptionStats();
      })
    );

    // Subscribe to allocations updates
    this.subscriptions.add(
      this.data.allocations$.subscribe(allocations => {
        this.activeAllocations = allocations.filter(a => a.status === 'Reserved' || a.status === 'Issued').length;
        this.updateOptionStats();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateOptionStats(): void {
    this.options = [
      {
        title: 'Material Inventory Dashboard',
        description: 'Overview of all materials in stock, categorized, with stock health at a glance.',
        icon: 'dashboard',
        route: 'dashboard',
        accent: 'blue',
        stat: this.totalMaterials.toString(),
        statLabel: 'Tracked materials',
      },
      {
        title: 'Stock Monitoring',
        description: 'Track stock levels per site, spot low or out-of-stock items before they cause delays.',
        icon: 'monitoring',
        route: 'stock',
        accent: 'orange',
        stat: (this.lowStockCount + this.outOfStockCount).toString(),
        statLabel: 'Low / out of stock',
      },
      {
        title: 'Material Requests',
        description: 'Projects request material from stock — approving issues it out and reduces inventory.',
        icon: 'requests',
        route: 'requests',
        accent: 'purple',
        stat: this.pendingRequests.toString(),
        statLabel: 'Open requests',
      },
      {
        title: 'Material Allocation',
        description: 'Reserve and allocate materials to specific projects. Track issued and returned items.',
        icon: 'allocation',
        route: 'allocation',
        accent: 'green',
        stat: this.activeAllocations.toString(),
        statLabel: 'Active allocations',
      },
      {
        title: 'Stock Management',
        description: 'Manage materials catalog, add new items, edit existing ones, and adjust stock levels.',
        icon: 'management',
        route: 'management',
        accent: 'teal',
        stat: this.totalMaterials.toString(),
        statLabel: 'Materials managed',
      }
    ];
  }

  open(route: string) {
    this.router.navigate(['/inventory', route]);
  }

  goBack(): void {
    this.location.back();
  }
}