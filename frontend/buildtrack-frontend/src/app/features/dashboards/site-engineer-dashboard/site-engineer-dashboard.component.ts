import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { } from '../../shared/sidebar/app-sidebar.component';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser } from '../../auth/models/auth.model';
import { ResourceDataService } from '../../resource-management/resource-data.service';
import { Resource } from '../../resource-management/models/resource.model';
import { InventoryDataService } from '../../inventory/inventory-data.service';
import { InventoryRecord } from '../../inventory/models/inventory.model';
import { WorkforceDataService } from '../../workforce/workforce-data.service';
import { AttendanceRecord } from '../../workforce/models/workforce.model';

@Component({
  selector: 'app-site-engineer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './site-engineer-dashboard.component.html',
  styleUrls: ['./site-engineer-dashboard.component.css'],
})
export class SiteEngineerDashboardComponent implements OnInit {
  currentUser: AppUser | null = null;
  equipment: Resource[] = [];
  stockAlerts: InventoryRecord[] = [];
  attendance: AttendanceRecord[] = [];

  inUseCount = 0;
  maintenanceCount = 0;
  presentToday = 0;
  lowStockCount = 0;

  constructor(
    private auth: AuthDataService,
    private resourceData: ResourceDataService,
    private inventoryData: InventoryDataService,
    private workforceData: WorkforceDataService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;

    this.resourceData.resources$.subscribe(resources => {
      this.equipment = resources;
      this.inUseCount = resources.filter(r => r.currentStatus === 'Allocated').length;
      this.maintenanceCount = resources.filter(r => r.currentStatus === 'Under Maintenance').length;
    });

    this.inventoryData.inventory$.subscribe(records => {
      this.stockAlerts = records.filter(r => this.inventoryData.getStockStatus(r) !== 'In Stock');
      this.lowStockCount = this.stockAlerts.length;
    });

    this.workforceData.attendance$.subscribe(records => {
      this.attendance = records;
      this.presentToday = records.filter(r => r.status === 'Present').length;
    });
  }

  resourceStatusClass(status: Resource['currentStatus']) {
    return { Available: 'green', Allocated: 'blue', 'Under Maintenance': 'orange' }[status];
  }

  stockStatusClass(record: InventoryRecord) {
    const status = this.inventoryData.getStockStatus(record);
    return { 'In Stock': 'green', 'Low Stock': 'orange', 'Out of Stock': 'red' }[status];
  }
}
