import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/project-status-dashboard/project-status-dashboard.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Add combineLatest import if not present
if "import { combineLatest } from 'rxjs';" not in ts_content:
    ts_content = ts_content.replace(
        "import { RouterModule } from '@angular/router';",
        "import { RouterModule } from '@angular/router';\nimport { combineLatest } from 'rxjs';"
    )

old_init = """  ngOnInit(): void {
    this.data.projects$.subscribe(projects => {
      this.projects = projects;
      this.computeStats();
    });
  }"""

new_init = """  ngOnInit(): void {
    combineLatest([this.data.projects$, this.data.milestones$]).subscribe(([projects, _]) => {
      this.projects = projects;
      this.computeStats();
    });
  }"""

ts_content = ts_content.replace(old_init, new_init)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
