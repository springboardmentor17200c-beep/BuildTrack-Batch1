import os
import re

# 1. Fix admin-dashboard project mapping
ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/admin-dashboard/admin-dashboard.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts = f.read()

ts = ts.replace("projectName: r.project,", "project: r.project,\n          projectName: r.project,")

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts)

# 2. Fix global text colors in dark mode
css_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/shared/bt-theme.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Make sure we add a generic override for .bt-text-secondary and .bt-admin-dashboard vars
if "body.bt-dark .bt-admin-dashboard" not in css:
    css += """

/* Fix missing dark mode colors in dashboards */
body.bt-dark .bt-admin-dashboard {
  --bt-text-secondary: #9aa1b1;
  --bt-bg-light: #12141c;
  --bt-border-light: #2a2f3d;
}

body.bt-dark .bt-text-secondary {
  color: #9aa1b1;
}

body.bt-dark .bt-table-modern td,
body.bt-dark .bt-table-modern th,
body.bt-dark .bt-font-medium {
  color: #f3f4f6;
}

"""
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)

