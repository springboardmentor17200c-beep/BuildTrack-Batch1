import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { } from '../../shared/sidebar/app-sidebar.component';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser, RoleName } from '../../auth/models/auth.model';
import { AnalyticsDataService } from '../../analytics/analytics-data.service';
import { ProjectsDataService } from '../../projects/projects-data.service';
import { environment } from '../../../../environments/environment';
import { Subscription, catchError, of } from 'rxjs';

const TOKEN_KEY = 'buildtrack_access_token';

interface RoleCount { role: string; count: number; }
interface ActivityItem { icon: 'user' | 'project' | 'budget' | 'resource'; text: string; time: string; }
interface ApiUser { user_id: number; full_name?: string; role?: string; created_at?: string; }

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser: AppUser | null = null;
  roleCounts: RoleCount[] = [];

  totalUsers = 0;
  activeProjects = 0;
  completedProjects = 0;
  totalProcurement = 0;
  budgetUsedPercent = 0;

  projects: any[] = [];
  activity: ActivityItem[] = [];

  private subs = new Subscription();

  constructor(
    private auth: AuthDataService,
    private analytics: AnalyticsDataService,
    private projectsData: ProjectsDataService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;

    // Load real users from backend
    const token = localStorage.getItem(TOKEN_KEY) ?? '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<ApiUser[]>(`${environment.apiUrl}/auth/users`, { headers })
      .pipe(catchError(() => of([] as ApiUser[])))
      .subscribe(users => {
        this.totalUsers = users.length;
        // Group by role
        const roleMap: Record<string, number> = {};
        users.forEach(u => {
          const role = u.role || 'Unknown';
          roleMap[role] = (roleMap[role] || 0) + 1;
        });
        this.roleCounts = Object.entries(roleMap)
          .map(([role, count]) => ({ role, count }))
          .sort((a, b) => b.count - a.count);

        // Build activity from recent users (last 3 registered)
        const recent = [...users]
          .filter(u => u.created_at)
          .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
          .slice(0, 2);
        recent.forEach(u => {
          this.activity.push({
            icon: 'user',
            text: `New user registered — ${u.full_name || 'User'} (${u.role || 'Member'})`,
            time: this.timeAgo(u.created_at!),
          });
        });
      });

    // Real projects from projects service
    this.subs.add(
      this.projectsData.projects$.subscribe(projs => {
        this.projects = projs;
        this.activeProjects = projs.filter(p => p.status === 'In Progress').length;
        this.completedProjects = projs.filter(p => p.status === 'Completed').length;

        // Build project activity items (most recently updated/started)
        const recent = [...projs]
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 2);
        recent.forEach(p => {
          this.activity.unshift({
            icon: 'project',
            text: `${p.projectName} — status: ${p.status}`,
            time: this.timeAgo(p.startDate),
          });
        });
      })
    );

    // Analytics progress for chart
    this.subs.add(
      this.analytics.progress$.subscribe(rows => {
        if (rows.length === 0) return;
        this.projects = rows.map(r => ({
          project: r.project,
          projectName: r.project,
          status: r.status,
          completionPercentage: r.completionPercentage,
        }));
        this.activeProjects = rows.filter(r => r.status === 'In Progress').length;
      })
    );

    // Procurement stats
    this.subs.add(
      this.analytics.purchaseOrders$.subscribe(pos => {
        this.totalProcurement = pos.reduce((s, po) => s + po.totalAmount, 0);
        // Build procurement activity
        pos.slice(0, 1).forEach(po => {
          this.activity.push({
            icon: 'budget',
            text: `PO ${po.purchaseOrderId} — ${po.vendor} • ₹${(po.totalAmount / 100000).toFixed(1)}L (${po.orderStatus})`,
            time: this.timeAgo(po.orderDate),
          });
        });
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  private timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  statusClass(status: string) {
    return ({ Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green', Active: 'green' } as any)[status] || 'gray';
  }

  roleClass(role: string) {
    return ({
      Administrator: 'purple', 'Project Manager': 'blue',
      'Site Engineer': 'orange', Contractor: 'green',
      Worker: 'gray', 'Client / Owner': 'blue', Vendor: 'purple',
    } as any)[role] || 'gray';
  }
}
