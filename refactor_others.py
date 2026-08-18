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

icon_proj = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M7 15l3-4 3 3 5-7"></path></svg>'
icon_prog = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"></path></svg>'
icon_budget = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v10"></path></svg>'
icon_order = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12z"></path></svg>'
icon_user = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>'
icon_site = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path><path d="M14 16h1"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>'
icon_alert = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'

# ---------------- CONTRACTOR DASHBOARD ----------------
co_kpis = [
    ('green', icon_user, '{{ crewSize }}', 'Crew Size'),
    ('purple', icon_prog, '{{ shiftsThisWeek }}', 'Shifts Scheduled'),
    ('blue', icon_proj, '{{ equipmentAllocated }}', 'Equipment Allocated'),
    ('orange', icon_order, '{{ pendingRequests }}', 'Pending Requests')
]
co_left = """
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>My Material Requests</h3>
                <p>Track request statuses</p>
              </div>
              <a class="bt-btn-ghost" [routerLink]="['/inventory/requests']">
                New Request
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
              </a>
            </div>
            
            <div class="bt-table-responsive">
              <table class="bt-table-modern">
                <thead><tr><th>Material</th><th>Quantity</th><th>Project</th><th>Status</th></tr></thead>
                <tbody>
                  <tr *ngFor="let r of requests">
                    <td class="bt-font-medium">{{ r.materialName }}</td>
                    <td>{{ r.requestedQuantity }} {{ r.unitOfMeasure }}</td>
                    <td>{{ r.project }}</td>
                    <td>
                      <span class="bt-status-pill" [ngClass]="requestStatusClass(r.requestStatus)">
                        <span class="bt-status-dot"></span>
                        {{ r.requestStatus }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>Equipment Allocated</h3>
                <p>Tools and machinery currently assigned to you</p>
              </div>
              <a class="bt-btn-ghost" [routerLink]="['/resources/allocation']">View All</a>
            </div>
            <div class="bt-table-responsive">
              <table class="bt-table-modern">
                <thead><tr><th>Resource</th><th>Project</th><th>Return By</th></tr></thead>
                <tbody>
                  <tr *ngFor="let a of allocations">
                    <td class="bt-font-medium">{{ a.resourceName }}</td>
                    <td>{{ a.project }}</td>
                    <td class="bt-text-secondary">{{ a.expectedReturnDate }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
"""
co_right = """
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>Shift Schedule</h3>
                <p>Your team's shifts</p>
              </div>
              <a class="bt-btn-ghost" [routerLink]="['/workforce/shifts']">View All</a>
            </div>
            <div class="bt-table-responsive">
              <table class="bt-table-modern">
                <thead><tr><th>Worker</th><th>Shift</th><th>Date</th></tr></thead>
                <tbody>
                  <tr *ngFor="let s of shifts">
                    <td class="bt-font-medium">{{ s.employeeName }}</td>
                    <td>
                      <span class="bt-status-pill" [ngClass]="shiftClass(s.shiftType)">
                        <span class="bt-status-dot"></span>
                        {{ s.shiftType }}
                      </span>
                    </td>
                    <td class="bt-text-secondary">{{ s.shiftDate }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
"""

rewrite_dashboard(
    'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/contractor-dashboard/contractor-dashboard.component.html',
    'Contractor', 'Your crew, shift schedule, allocated equipment, and material requests.',
    co_kpis, co_left, co_right
)

# ---------------- CLIENT DASHBOARD ----------------
cl_kpis = [
    ('blue', icon_proj, '{{ projects.length }}', 'Your Projects'),
    ('purple', icon_budget, '{{ budgetUsedPercent }}%', 'Budget Utilized')
]
cl_left = """
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>Project Progress</h3>
                <p>Overall status and completion</p>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:18px;padding:16px;">
              <div *ngFor="let p of projects">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <div>
                    <div class="bt-font-medium">{{ p.project }}</div>
                    <div class="bt-text-secondary" style="font-size:12px;">Expected completion: {{ p.expectedEndDate }}</div>
                  </div>
                  <span class="bt-status-pill" [ngClass]="statusClass(p.status)">
                    <span class="bt-status-dot"></span>
                    {{ p.status }}
                  </span>
                </div>
                <div class="bt-progress-wrapper">
                  <div class="bt-progress-track">
                    <div class="bt-progress-fill blue" [style.width.%]="p.completionPercentage"></div>
                  </div>
                  <span class="bt-progress-text">{{ p.completionPercentage }}%</span>
                </div>
              </div>
            </div>
          </div>
"""
cl_right = """
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>Recent Updates</h3>
                <p>Latest progress from your project team</p>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:14px;padding:16px;">
              <div *ngFor="let u of updates" style="display:flex;gap:12px;align-items:flex-start;">
                <div class="bt-kpi-icon-wrap green-glow" style="width:34px;height:34px;flex-shrink:0;padding:6px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                </div>
                <div>
                  <div class="bt-font-medium" style="font-size:13.5px;">{{ u.text }}</div>
                  <div class="bt-text-secondary" style="font-size:12px;">{{ u.date }}</div>
                </div>
              </div>
            </div>
          </div>
"""

rewrite_dashboard(
    'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/client-dashboard/client-dashboard.component.html',
    'Client', 'Track your project\'s progress and recent updates.',
    cl_kpis, cl_left, cl_right
)
