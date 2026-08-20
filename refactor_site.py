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


# ---------------- SITE ENGINEER DASHBOARD ----------------
se_kpis = [
    ('blue', icon_proj, '{{ inUseCount }}', 'Equipment In Use'),
    ('orange', icon_alert, '{{ maintenanceCount }}', 'Under Maintenance'),
    ('red', icon_order, '{{ lowStockCount }}', 'Stock Alerts'),
    ('green', icon_user, '{{ presentToday }}', 'Present Today')
]
se_left = """
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>Equipment Status</h3>
                <p>All tracked assets</p>
              </div>
              <a class="bt-btn-ghost" [routerLink]="['/resources/tracking']">
                View All
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
              </a>
            </div>
            
            <div class="bt-table-responsive">
              <table class="bt-table-modern">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of equipment">
                    <td class="bt-font-medium">{{ r.resourceName }}</td>
                    <td>{{ r.category }}</td>
                    <td>
                      <span class="bt-status-pill" [ngClass]="resourceStatusClass(r.currentStatus)">
                        <span class="bt-status-dot"></span>
                        {{ r.currentStatus }}
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
                <h3>Today's Attendance</h3>
                <p>{{ presentToday }} present so far</p>
              </div>
              <a class="bt-btn-ghost" [routerLink]="['/workforce/attendance']">Mark Attendance</a>
            </div>
            
            <div class="bt-table-responsive">
              <table class="bt-table-modern">
                <thead><tr><th>Worker</th><th>Status</th><th>Check In</th></tr></thead>
                <tbody>
                  <tr *ngFor="let a of attendance">
                    <td class="bt-font-medium">{{ a.employeeName }}</td>
                    <td>
                      <span class="bt-status-pill" [ngClass]="{ green: a.status === 'Present', red: a.status === 'Absent', orange: a.status === 'Half Day', blue: a.status === 'On Leave' }">
                        <span class="bt-status-dot"></span>
                        {{ a.status }}
                      </span>
                    </td>
                    <td class="bt-text-secondary">{{ a.checkInTime || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
"""
se_right = """
          <div class="bt-premium-panel">
            <div class="bt-panel-header">
              <div class="bt-panel-header-text">
                <h3>Stock Alerts</h3>
                <p>Needs attention</p>
              </div>
              <a class="bt-btn-ghost" [routerLink]="['/inventory/stock']">View Stock</a>
            </div>
            <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
              <div *ngFor="let s of stockAlerts" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--bt-border);padding-bottom:8px;">
                <span class="bt-font-medium">{{ s.materialName }}</span>
                <span class="bt-badge" [ngClass]="stockStatusClass(s)">{{ s.availableQuantity }} {{ s.unitOfMeasure }}</span>
              </div>
              <div *ngIf="stockAlerts.length === 0" style="color:var(--bt-text-muted);">No stock alerts right now.</div>
            </div>
          </div>
"""

rewrite_dashboard(
    'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/site-engineer-dashboard/site-engineer-dashboard.component.html',
    'Site Engineer', 'Equipment status, stock alerts, and today\'s attendance for your site.',
    se_kpis, se_left, se_right
)
