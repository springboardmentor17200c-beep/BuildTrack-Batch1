import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSidebarComponent } from '../../shared/sidebar/app-sidebar.component';
import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUser } from '../../../core/auth/auth.models';
import { WorkforceDataService } from '../../workforce/workforce-data.service';
import { Shift, Employee } from '../../workforce/models/workforce.model';
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
  currentUser: CurrentUser | null = null;
  workers: Employee[] = [];
  shifts: Shift[] = [];
  allocations: ResourceAllocation[] = [];
  requests: MaterialRequest[] = [];

  crewSize = 0;
  shiftsThisWeek = 0;
  equipmentAllocated = 0;
  pendingRequests = 0;

  constructor(
    private auth: AuthService,
    private workforceData: WorkforceDataService,
    private resourceData: ResourceDataService,
    private inventoryData: InventoryDataService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;

    this.workforceData.employees$.subscribe(employees => {
      this.workers = employees;
      this.crewSize = employees.length;
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
