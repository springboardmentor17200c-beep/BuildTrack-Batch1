import os

filepath = 'frontend/buildtrack-frontend/src/app/models/components/analytics/report-dashboard.component.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the entire topbar and filters with a cleaner layout containing a search bar
old_top_section = """      <div class="bt-topbar" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 class="bt-title">Reports & Documentation</h1>
          <p class="bt-subtitle">Generate, manage, and export project reports in PDF or Excel/CSV format</p>
        </div>
        <button class="bt-add-btn" routerLink="/analytics/reports/generate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Generate New Report</span>
        </button>
      </div>

      <!-- Report Filters -->
      <div class="bt-panel" style="margin-bottom: 24px;">
        <div class="bt-form-grid" style="align-items: flex-end;">
          <label>
            <span>Report Type</span>
            <select [(ngModel)]="selectedReportType" (change)="applyFilters()">
              <option value="all">All Reports</option>
              <option value="progress">Progress Reports</option>
              <option value="resource">Resource Reports</option>
              <option value="budget">Budget Reports</option>
              <option value="workforce">Workforce Reports</option>
              <option value="procurement">Procurement Reports</option>
            </select>
          </label>
          <label>
            <span>Status</span>
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()">
              <option value="all">All Status</option>
              <option value="generated">Generated</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </label>
          <div style="grid-column: span 2;">
            <label style="display: block; margin-bottom: 6px;">
              <span>Date Range</span>
            </label>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="date" [(ngModel)]="startDate" (change)="applyFilters()" style="flex: 1;">
              <span style="color: var(--text-secondary); font-size: 13px; font-weight: 600;">to</span>
              <input type="date" [(ngModel)]="endDate" (change)="applyFilters()" style="flex: 1;">
            </div>
          </div>
          <div>
            <button class="bt-filter-btn" (click)="clearFilters()" style="width: 100%; justify-content: center; margin-top: 24px;">
              Clear Filters
            </button>
          </div>
        </div>
      </div>"""

new_top_section = """      <div class="bt-topbar" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 class="bt-title">Reports Dashboard</h1>
          <p class="bt-subtitle">View and export your generated project reports</p>
        </div>
        <div style="display: flex; gap: 16px; align-items: center;">
          <input type="text" [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="🔍 Search reports..." style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--bt-panel-border); min-width: 250px;">
          <button class="bt-add-btn" routerLink="/analytics/reports/generate" style="background: #3b82f6; color: white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Generate New</span>
          </button>
        </div>
      </div>"""

content = content.replace(old_top_section, new_top_section)

# 2. Simplify the table (Remove Status and Format columns)
table_header_old = """            <thead>
              <tr>
                <th>Report Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date Generated</th>
                <th>Format</th>
                <th style="text-align: right">Actions</th>
              </tr>
            </thead>"""

table_header_new = """            <thead>
              <tr>
                <th>Report Name</th>
                <th>Category</th>
                <th>Date Generated</th>
                <th style="text-align: right">Downloads</th>
              </tr>
            </thead>"""
content = content.replace(table_header_old, table_header_new)

table_row_old = """              <tr *ngFor="let report of filteredReports">
                <td>
                  <div class="bt-strong">{{ report.title }}</div>
                  <div class="bt-muted" style="font-size: 12px; margin-top: 4px;">{{ report.description }}</div>
                </td>
                <td>
                  <span class="bt-badge" [ngClass]="report.type === 'progress' ? 'blue' : report.type === 'budget' ? 'green' : report.type === 'resource' ? 'purple' : report.type === 'workforce' ? 'orange' : 'gray'">
                    {{ report.type | uppercase }}
                  </span>
                </td>
                <td>
                  <span class="bt-badge gray">{{ report.status }}</span>
                </td>
                <td>{{ report.generatedDate | date:'mediumDate' }}</td>
                <td><span class="bt-badge gray">{{ report.format | uppercase }}</span></td>
                <td style="text-align: right">
                  <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="bt-filter-btn" (click)="exportPDF(report)" title="Export HTML/PDF">
                      PDF
                    </button>
                    <button class="bt-filter-btn" (click)="exportExcel(report)" title="Export CSV/Excel">
                      CSV
                    </button>
                    <button class="bt-filter-btn" (click)="deleteReport(report.id)" style="color: var(--bt-red);">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>"""

table_row_new = """              <tr *ngFor="let report of filteredReports">
                <td>
                  <div class="bt-strong" style="font-size: 15px;">{{ report.title }}</div>
                </td>
                <td>
                  <span class="bt-badge" [ngClass]="report.type === 'progress' ? 'blue' : report.type === 'budget' ? 'green' : report.type === 'procurement' ? 'orange' : 'gray'">
                    {{ report.type | uppercase }}
                  </span>
                </td>
                <td style="color: var(--text-secondary);">{{ report.generatedDate | date:'mediumDate' }}</td>
                <td style="text-align: right">
                  <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="bt-filter-btn" (click)="exportPDF(report)" title="Download HTML/PDF">
                      📥 HTML
                    </button>
                    <button class="bt-filter-btn" (click)="exportExcel(report)" title="Download CSV Data">
                      📊 CSV
                    </button>
                    <button class="bt-filter-btn" (click)="deleteReport(report.id)" style="color: #ef4444; background: #fef2f2; border-color: #fecaca;" title="Delete Report">
                      Trash
                    </button>
                  </div>
                </td>
              </tr>"""
content = content.replace(table_row_old, table_row_new)

# 3. Simplify the empty state
empty_state_old = """      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredReports.length === 0" class="bt-panel" style="padding: 48px; text-align: center;">
        <h3 class="bt-strong" style="margin-bottom: 8px; font-size: 18px;">No Reports Found</h3>
        <p class="bt-muted" style="margin-bottom: 24px;">Adjust your filters or generate a new report to get started.</p>
        <button class="bt-add-btn" routerLink="/analytics/reports/generate" style="margin: 0 auto;">
          <span>Generate Report</span>
        </button>
      </div>"""

empty_state_new = """      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredReports.length === 0" class="bt-panel" style="padding: 80px 48px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">📁</div>
        <h3 class="bt-strong" style="margin-bottom: 8px; font-size: 20px;">No Reports Found</h3>
        <p class="bt-muted" style="margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto;">You haven't generated any reports yet, or none match your search.</p>
        <button class="bt-add-btn" routerLink="/analytics/reports/generate" style="margin: 0 auto; background: #3b82f6; color: white;">
          <span>Generate Your First Report</span>
        </button>
      </div>"""
content = content.replace(empty_state_old, empty_state_new)

# 4. Update the TS class variables
ts_class_old = """export class ReportsDashboardComponent implements OnInit {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  isLoading = false;

  selectedReportType = 'all';
  selectedStatus = 'all';
  startDate = '';
  endDate = '';"""

ts_class_new = """export class ReportsDashboardComponent implements OnInit {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  isLoading = false;

  searchTerm = '';"""
content = content.replace(ts_class_old, ts_class_new)

# 5. Update applyFilters logic
apply_filters_old = """  applyFilters() {
    this.filteredReports = this.reports.filter(report => {
      let matches = true;

      if (this.selectedReportType !== 'all' && report.type !== this.selectedReportType) {
        matches = false;
      }

      if (this.selectedStatus !== 'all' && report.status !== this.selectedStatus) {
        matches = false;
      }

      if (this.startDate && this.endDate) {
        const reportDate = new Date(report.generatedDate);
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        if (reportDate < start || reportDate > end) {
          matches = false;
        }
      }

      return matches;
    });
  }

  clearFilters() {
    this.selectedReportType = 'all';
    this.selectedStatus = 'all';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }"""

apply_filters_new = """  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredReports = [...this.reports];
      return;
    }
    
    this.filteredReports = this.reports.filter(report => 
      report.title.toLowerCase().includes(term) || 
      report.type.toLowerCase().includes(term)
    );
  }"""
content = content.replace(apply_filters_old, apply_filters_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
