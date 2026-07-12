import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSidebarComponent } from '../../shared/sidebar/app-sidebar.component';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser } from '../../auth/models/auth.model';
import { WorkforceDataService } from '../../workforce/workforce-data.service';
import { Shift, Worker } from '../../workforce/models/workforce.model';
import { ResourceDataService } from '../../resource-management/resource-data.service';
import { ResourceAllocation } from '../../resource-management/models/resource.model';
import { InventoryDataService } from '../../inventory/inventory-data.service';
import { MaterialRequest } from '../../inventory/models/inventory.model';

@Component({
  selector: 'app-contractor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSidebarComponent],
  templateUrl: './contractor-dashboard.component.html',
  styleUrls: ['./contractor-dashboard.component.css'],
})
export class ContractorDashboardComponent implements OnInit {
  currentUser: AppUser | null = null;
  workers: Worker[] = [];
  shifts: Shift[] = [];
  allocations: ResourceAllocation[] = [];
  requests: MaterialRequest[] = [];

  crewSize = 0;
  shiftsThisWeek = 0;
  equipmentAllocated = 0;
  pendingRequests = 0;

  constructor(
    private auth: AuthDataService,
    private workforceData: WorkforceDataService,
    private resourceData: ResourceDataService,
    private inventoryData: InventoryDataService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;

    this.workforceData.workers$.subscribe(workers => {
      this.workers = workers;
      this.crewSize = workers.length;
    });

    this.workforceData.shifts$.subscribe(shifts => {
      this.shifts = shifts;
      this.shiftsThisWeek = shifts.length;
    });

    this.resourceData.allocations$.subscribe(allocations => {
      this.allocations = allocations.filter(a => a.allocationStatus === 'Allocated' || a.allocationStatus === 'Overdue');
      this.equipmentAllocated = this.allocations.length;
    });

    this.inventoryData.requests$.subscribe(requests => {
      this.requests = requests;
      this.pendingRequests = requests.filter(r => r.requestStatus === 'Pending').length;
    });
  }

  shiftClass(type: Shift['shiftType']) {
    return { Morning: 'blue', Evening: 'orange', Night: 'purple' }[type];
  }

  requestStatusClass(status: MaterialRequest['requestStatus']) {
    return { Pending: 'orange', Approved: 'green', Rejected: 'red' }[status];
  }
}
