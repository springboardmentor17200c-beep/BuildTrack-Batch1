import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { } from '../../shared/sidebar/app-sidebar.component';
import { ProcurementDataService } from '../procurement-data.service';
import { MaterialRequest, MaterialRequestStatus } from '../models/procurement.model';
import { AuthDataService } from '../../auth/auth-data.service';
import { ProjectsDataService } from '../../projects/projects-data.service';

@Component({
  selector: 'app-procurement-requests',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './procurement-requests.component.html',
  styleUrls: ['./procurement-requests.component.css'],
})
export class ProcurementRequestsComponent implements OnInit {
  requests: MaterialRequest[] = [];
  projects: any[] = [];
  statuses: MaterialRequestStatus[] = ['Pending PM Approval', 'PM Approved', 'Rejected by PM', 'Revision Required'];
  priorities = ['Low', 'Medium', 'High', 'Urgent'];
  showForm = false;
  loading = true;
  loadError = '';
  formError = '';
  form: FormGroup;
  selectedRequestId: string | null = null;
  deletingId: string | null = null;

  get selectedRequest(): MaterialRequest | undefined {
    return this.requests.find(r => r.id === this.selectedRequestId);
  }

  get canManageStatus(): boolean {
    const role = this.auth.currentUser?.role;
    return role === 'Administrator' || role === 'Project Manager';
  }

  get canCreateRequest(): boolean {
    const role = this.auth.currentUser?.role;
    return role === 'Administrator' || role === 'Site Engineer';
  }

  get isSEorAdmin(): boolean {
    const role = this.auth.currentUser?.role;
    return role === 'Site Engineer' || role === 'Administrator';
  }

  isDeletable(req: MaterialRequest): boolean {
    const deletable = ['Pending PM Approval', 'Revision Required', 'Rejected by PM'];
    return this.isSEorAdmin && deletable.includes(req.status);
  }

  constructor(
    private data: ProcurementDataService, 
    private projectsData: ProjectsDataService,
    private fb: FormBuilder, 
    private auth: AuthDataService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      projectId: ['', Validators.required],
      material: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      requiredDate: ['', Validators.required],
      priority: ['Medium', Validators.required]
    });
  }

  ngOnInit(): void {
    this.projectsData.projects$.subscribe(p => this.projects = p);
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.selectedRequestId = id;
      }
    });

    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.data.getProcurementRequests().subscribe({
      next: requests => {
        this.requests = requests;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.loadError = err.message || 'Could not load procurement requests.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  statusClass(status: string) {
    if (status.includes('Pending') || status.includes('Processing')) return 'orange';
    if (status.includes('Approved') || status.includes('Selected') || status.includes('Generated') || status.includes('Sent')) return 'blue';
    if (status.includes('Received') || status === 'Completed') return 'green';
    if (status.includes('Reject') || status.includes('Cancel')) return 'red';
    return 'gray';
  }

  getProjectName(projectId: string): string {
    const p = this.projects.find(x => x.projectId === projectId);
    return p ? p.projectName : projectId;
  }

  updateStatus(request: MaterialRequest, status: string) {
    const action = status === 'PM Approved' 
      ? this.data.approveRequest(request.id, 'Approved by Project Manager')
      : status === 'Rejected by PM'
        ? this.data.rejectRequest(request.id, 'Rejected by Project Manager')
        : null;
        
    if (action) {
      action.subscribe({
        next: () => {
          this.loadRequests();
          if (status === 'PM Approved') {
            // After approval, automatically jump to workflow with this request
            this.router.navigate(['/procurement/workflow', request.id]);
          }
        },
        error: err => {
          this.loadError = err.message || 'Could not update request.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  selectRequest(id: string) {
    if (this.selectedRequestId === id) {
      this.router.navigate(['/procurement/requests']);
    } else {
      this.router.navigate(['/procurement/requests', id]);
    }
  }

  deleteRequest(req: MaterialRequest, event: Event) {
    event.stopPropagation(); // don't open the detail panel
    if (!confirm('Delete this procurement request? This cannot be undone.')) return;

    this.deletingId = req.id; // triggers CSS exit animation
    this.cdr.detectChanges();

    // Wait for animation to finish (400ms) then call API + remove from list
    setTimeout(() => {
      this.data.deleteRequest(req.id).subscribe({
        next: () => {
          this.requests = this.requests.filter(r => r.id !== req.id);
          if (this.selectedRequestId === req.id) {
            this.selectedRequestId = null;
            this.router.navigate(['/procurement/requests']);
          }
          this.deletingId = null;
          this.cdr.detectChanges();
        },
        error: err => {
          this.deletingId = null;
          this.loadError = err.message || 'Could not delete request.';
          this.cdr.detectChanges();
        }
      });
    }, 380);
  }

  submit() {
    this.formError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      this.formError = 'You must be signed in to submit a request.';
      return;
    }

    const v = this.form.value;
    this.data
      .createProcurementRequest({
        projectId: v.projectId,
        material: v.material,
        quantity: Number(v.quantity),
        requiredDate: v.requiredDate,
        priority: v.priority
      })
      .subscribe({
        next: () => {
          this.form.reset({ quantity: 1, priority: 'Medium' });
          this.showForm = false;
          this.loadRequests();
        },
        error: err => (this.formError = err.message || 'Could not submit request.'),
      });
  }
}