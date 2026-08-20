import os
import re

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/project-listing/project-listing.component.ts'
html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/project-listing/project-listing.component.html'

# 1. Update project-listing.component.ts
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

if "availableManagers" not in ts_content:
    ts_content = ts_content.replace(
        "dbStatuses: ProjectStatusOption[] = [];",
        "dbStatuses: ProjectStatusOption[] = [];\n  availableManagers: string[] = [];\n  availableClients: string[] = [];"
    )

    ng_init_addition = """
    this.subs.add(
      this.auth.getAllUsers().subscribe(users => {
        this.availableManagers = users.filter(u => u.role === 'Project Manager').map(u => u.fullName || u.username);
        this.availableClients = users.filter(u => u.role === 'Client / Owner').map(u => u.fullName || u.companyName || u.username);
      })
    );
"""
    ts_content = ts_content.replace(
        "this.auth.currentUser$.subscribe",
        ng_init_addition + "\n    this.auth.currentUser$.subscribe"
    )
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)

# 2. Update project-listing.component.html
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Replace Manager input with select
manager_input = '<input type="text" formControlName="manager" placeholder="e.g. Priya Menon" />'
manager_select = """<select formControlName="manager">
            <option value="" disabled selected>Select a manager</option>
            <option *ngFor="let m of availableManagers" [value]="m">{{ m }}</option>
          </select>"""
html_content = html_content.replace(manager_input, manager_select)

# Replace Client input with select
client_input = '<input type="text" formControlName="client" placeholder="e.g. L&T Realty" />'
client_select = """<select formControlName="client">
            <option value="" disabled selected>Select a client</option>
            <option *ngFor="let c of availableClients" [value]="c">{{ c }}</option>
          </select>"""
html_content = html_content.replace(client_input, client_select)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
