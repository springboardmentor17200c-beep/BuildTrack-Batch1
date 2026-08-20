import os

def rewrite_dashboard(file_path, role_fallback, subtitle, kpis, left_panels, right_panels):
    kpi_html = ""
    for color, icon, val, label in kpis:
        kpi_html += f"""
        <div class="bt-kpi-card">
          <div class="bt-kpi-icon-wrap {color}-glow">
            {icon}
          </div>
          <div class="bt-kpi-details">
            <span class="bt-kpi-value">{val}</span>
            <span class="bt-kpi-label">{label}</span>
          </div>
        </div>"""

    html = f"""<div class="bt-admin-dashboard bt-fade-in">
      
      <!-- Premium Hero Header -->
      <div class="bt-hero-header">
        <div class="bt-hero-bg"></div>
        <div class="bt-hero-content">
          <div class="bt-hero-text">
            <h1 class="bt-hero-title">Welcome back, {{{{ currentUser?.fullName || '{role_fallback}' }}}}</h1>
            <p class="bt-hero-subtitle">{subtitle}</p>
          </div>
          <div class="bt-hero-actions">
            <span class="bt-hero-badge">{{{{ currentUser?.role }}}}</span>
            <a class="bt-hero-btn" [routerLink]="['/profile']">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Profile
            </a>
          </div>
        </div>
      </div>

      <!-- Stat Cards Grid -->
      <div class="bt-kpi-grid">{kpi_html}
      </div>

      <!-- Main Content Grids -->
      <div class="bt-dashboard-grid-main">
        
        <!-- Left Column -->
        <div class="bt-dashboard-col">
          {left_panels}
        </div>

        <!-- Right Column -->
        <div class="bt-dashboard-col">
          {right_panels}
        </div>
        
      </div>
</div>
"""
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)

# Icons
icon_proj = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M7 15l3-4 3 3 5-7"></path></svg>'
icon_prog = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"></path></svg>'
icon_budget = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v10"></path></svg>'
icon_order = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12z"></path></svg>'
icon_user = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>'
icon_site = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path><path d="M14 16h1"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>'
icon_alert = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'

proj_panel = """
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>Project Progress</h3>
                <p>Live Status</p>
              </div>
              <a class="bt-btn-ghost" [routerLink]="['/analytics/progress']">
                View All
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
              </a>
            </div>
            
            <div class="bt-table-responsive">
              <table class="bt-table-modern">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of projects">
                    <td class="bt-font-medium">{{ p.project || p.projectName }}</td>
                    <td>
                      <span class="bt-status-pill" [ngClass]="statusClass(p.status)">
                        <span class="bt-status-dot"></span>
                        {{ p.status }}
                      </span>
                    </td>
                    <td>
                      <div class="bt-progress-wrapper">
                        <div class="bt-progress-track">
                          <div class="bt-progress-fill" [ngClass]="statusClass(p.status)" [style.width.%]="p.completionPercentage || p.completion_percentage || 0"></div>
                        </div>
                        <span class="bt-progress-text">{{ p.completionPercentage || p.completion_percentage || 0 }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
"""

# PM DASHBOARD
pm_kpis = [
    ('blue', icon_proj, '{{ activeProjects }}', 'Active Projects'),
    ('purple', icon_prog, '{{ avgProgress }}%', 'Avg. Progress'),
    ('orange', icon_budget, '{{ budgetUsedPercent }}%', 'Budget Used'),
    ('red', icon_order, '{{ pendingOrders }}', 'Pending Orders')
]
pm_right = """
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>Workforce Status</h3>
                <p>{{ totalWorkers }} Total Workers</p>
              </div>
              <a class="bt-btn-ghost" [routerLink]="['/workforce']">Manage</a>
            </div>
            <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--bt-border);padding-bottom:8px;">
                <span class="bt-text-secondary">Present Today</span><span class="bt-font-medium">{{ presentToday }}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span class="bt-text-secondary">On Leave</span><span class="bt-font-medium">{{ onLeave }}</span>
              </div>
            </div>
          </div>
          
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>Resource Utilization</h3>
                <p>{{ inUseCount }} In Use</p>
              </div>
              <a class="bt-btn-ghost" [routerLink]="['/resources']">View</a>
            </div>
            <div style="padding:16px;">
              <div class="bt-progress-wrapper" style="margin-top:8px;">
                <span class="bt-text-secondary" style="width:100px;">Avg. Utilization</span>
                <div class="bt-progress-track" style="flex:1;">
                  <div class="bt-progress-fill purple" [style.width.%]="resourceUtilization"></div>
                </div>
                <span class="bt-progress-text">{{ resourceUtilization }}%</span>
              </div>
            </div>
          </div>
"""
rewrite_dashboard(
    'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/pm-dashboard/pm-dashboard.component.html',
    'Project Manager', 'Your projects, budgets, workforce, and resources at a glance.',
    pm_kpis, proj_panel, pm_right
)

# SITE ENGINEER DASHBOARD
se_kpis = [
    ('blue', icon_proj, '{{ activeProjects }}', 'Assigned Projects'),
    ('green', icon_site, '{{ totalWorkers }}', 'Workers on Site'),
    ('orange', icon_alert, '{{ pendingIssues || 0 }}', 'Open Issues'),
    ('purple', icon_order, '{{ pendingOrders }}', 'Pending Material')
]
rewrite_dashboard(
    'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/site-engineer-dashboard/site-engineer-dashboard.component.html',
    'Site Engineer', 'Track daily progress, workforce, and material deliveries.',
    se_kpis, proj_panel, pm_right
)

# CONTRACTOR DASHBOARD
co_kpis = [
    ('blue', icon_proj, '{{ activeProjects }}', 'Contracted Projects'),
    ('purple', icon_prog, '{{ avgProgress }}%', 'Overall Progress'),
    ('green', icon_user, '{{ totalWorkers }}', 'Workers Supplied'),
    ('orange', icon_budget, '{{ budgetUsedPercent }}%', 'Budget Tracked')
]
rewrite_dashboard(
    'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/contractor-dashboard/contractor-dashboard.component.html',
    'Contractor', 'Manage your team, track contracts, and update site progress.',
    co_kpis, proj_panel, pm_right
)

# CLIENT DASHBOARD
cl_kpis = [
    ('blue', icon_proj, '{{ totalProjects }}', 'Total Projects'),
    ('purple', icon_prog, '{{ avgProgress }}%', 'Avg. Completion'),
    ('orange', icon_budget, '{{ budgetUsedPercent }}%', 'Budget Used'),
    ('green', icon_alert, '{{ completedProjects }}', 'Completed')
]
rewrite_dashboard(
    'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/client-dashboard/client-dashboard.component.html',
    'Client', 'Monitor your investments and live project tracking.',
    cl_kpis, proj_panel, pm_right
)

# WORKER DASHBOARD
wo_kpis = [
    ('blue', icon_proj, '{{ assignedProjects.length || 0 }}', 'Assigned Sites'),
    ('green', icon_alert, '{{ completedTasks }}', 'Completed Tasks'),
    ('orange', icon_order, '{{ todayTasks }}', 'Tasks Today'),
    ('purple', icon_user, '{{ attendancePercent }}%', 'Attendance')
]
wo_proj_panel = """
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>My Sites</h3>
                <p>Where you are assigned</p>
              </div>
            </div>
            
            <div class="bt-table-responsive" *ngIf="assignedProjects.length > 0">
              <table class="bt-table-modern">
                <thead><tr><th>Site</th><th>Location</th><th>Status</th></tr></thead>
                <tbody>
                  <tr *ngFor="let p of assignedProjects">
                    <td class="bt-font-medium">{{ p.projectName }}</td>
                    <td>{{ p.location }}</td>
                    <td>
                      <span class="bt-status-pill" [ngClass]="statusClass(p.status)">
                        <span class="bt-status-dot"></span>
                        {{ p.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style="padding: 20px; text-align: center; color: var(--bt-text-muted);" *ngIf="assignedProjects.length === 0">
              No sites assigned currently.
            </div>
          </div>
"""
wo_right = """
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>Daily Tasks</h3>
                <p>To-Do List</p>
              </div>
            </div>
            <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <input type="checkbox" checked disabled>
                <span style="text-decoration:line-through;color:var(--bt-text-muted)">Check in at Site A</span>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <input type="checkbox" checked disabled>
                <span style="text-decoration:line-through;color:var(--bt-text-muted)">Morning Briefing</span>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <input type="checkbox">
                <span>Material Unloading</span>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <input type="checkbox">
                <span>Site Cleanup</span>
              </div>
            </div>
          </div>
"""
rewrite_dashboard(
    'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/worker-dashboard/worker-dashboard.component.html',
    'Worker', 'Your daily tasks and site assignments.',
    wo_kpis, wo_proj_panel, wo_right
)
