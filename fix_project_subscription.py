import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/project-listing/project-listing.component.ts'

with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

ng_init_addition = """
    this.subs.add(
      this.auth.getAllUsers().subscribe(users => {
        this.availableManagers = users.filter(u => u.role === 'Project Manager').map(u => u.fullName || u.username);
        this.availableClients = users.filter(u => u.role === 'Client / Owner').map(u => u.fullName || u.companyName || u.username);
      })
    );
"""

if "getAllUsers" not in ts_content:
    ts_content = ts_content.replace(
        "ngOnInit(): void {",
        "ngOnInit(): void {\n" + ng_init_addition
    )

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
