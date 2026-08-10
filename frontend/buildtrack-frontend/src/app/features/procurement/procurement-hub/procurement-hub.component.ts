import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppSidebarComponent } from '../../shared/sidebar/app-sidebar.component';
import { AuthDataService } from '../../auth/auth-data.service';
import { ProcurementDataService } from '../procurement-data.service';

@Component({
  selector: 'app-procurement-hub',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSidebarComponent],
  templateUrl: './procurement-hub.component.html',
  styleUrls: ['./procurement-hub.component.css'],
})
export class ProcurementHubComponent implements OnInit {
  vendorCount = 0;
  activeVendorCount = 0;
  requestCount = 0;
  pendingRequestCount = 0;
  loadError = '';

  get canManageVendors(): boolean {
    return this.auth.currentUser?.role === 'Administrator';
  }

  get canManageWorkflow(): boolean {
    const role = this.auth.currentUser?.role;
    return role === 'Administrator' || role === 'Site Engineer';
  }

  get canViewRequests(): boolean {
    const role = this.auth.currentUser?.role;
    return role === 'Administrator' || role === 'Project Manager' || role === 'Site Engineer';
  }

  constructor(
    private data: ProcurementDataService,
    private auth: AuthDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.auth.currentUser?.role === 'Vendor') {
      this.router.navigate(['/procurement/vendor-dashboard']);
      return;
    }

    this.data.getVendors().subscribe({
      next: vendors => {
        this.vendorCount = vendors.length;
        this.activeVendorCount = vendors.filter(v => v.isActive).length;
      },
      error: err => (this.loadError = err.message || 'Could not load vendors.'),
    });

    this.data.getProcurementRequests().subscribe({
      next: requests => {
        this.requestCount = requests.length;
        this.pendingRequestCount = requests.filter(r => r.status === 'Pending PM Approval').length;
      },
      error: err => (this.loadError = err.message || 'Could not load procurement requests.'),
    });
  }
}