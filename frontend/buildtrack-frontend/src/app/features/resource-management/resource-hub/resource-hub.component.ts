import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ResourceDataService } from '../resource-data.service';

interface ResourceOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  accent: string; // css var name for the accent color
  stat: string;
  statLabel: string;
}

interface ActivityItem {
  label: string;
  detail: string;
  tone: 'blue' | 'orange' | 'green';
}

@Component({
  selector: 'app-resource-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resource-hub.component.html',
  styleUrls: ['./resource-hub.component.css'],
})
export class ResourceHubComponent implements OnInit {
  totalAssets = 0;
  inUseCount = 0;
  availableCount = 0;
  maintenanceCount = 0;

  options: ResourceOption[] = [
    {
      title: 'Resource Allocation',
      description: 'Assign equipment and machinery to active projects and track who is responsible for what.',
      icon: 'allocation',
      route: 'allocation',
      accent: 'blue',
      stat: '4',
      statLabel: 'Active allocations',
    },
    {
      title: 'Equipment Tracking',
      description: 'See real-time status, location and maintenance schedule for every piece of equipment.',
      icon: 'tracking',
      route: 'tracking',
      accent: 'orange',
      stat: '12',
      statLabel: 'Tracked assets',
    },
    {
      title: 'Resource Utilization',
      description: 'Analyze how efficiently machinery and equipment are being used across all sites.',
      icon: 'dashboard',
      route: 'utilization',
      accent: 'purple',
      stat: '54%',
      statLabel: 'Avg. utilization',
    },
  ];

  constructor(private router: Router, private data: ResourceDataService) {}

  ngOnInit(): void {
    this.data.resources$.subscribe(resources => {
      this.totalAssets = resources.length;
      this.inUseCount = resources.filter(r => r.status === 'In Use').length;
      this.availableCount = resources.filter(r => r.status === 'Available').length;
      this.maintenanceCount = resources.filter(r => r.status === 'Under Maintenance').length;
    });
  }

  open(route: string) {
    this.router.navigate(['/resources', route]);
  }
}
