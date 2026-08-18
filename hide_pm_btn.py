import os
import re

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/project-listing/project-listing.component.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

if "canCreateProject = true;" not in ts_content:
    old_props = """  showForm = false;
  submitting = false;"""

    new_props = """  canCreateProject = true;
  showForm = false;
  submitting = false;"""

    ts_content = ts_content.replace(old_props, new_props)

    old_init = """  ngOnInit(): void {"""

    new_init = """  ngOnInit(): void {
    const role = this.auth.currentUser?.role;
    this.canCreateProject = role !== 'Project Manager';"""

    ts_content = ts_content.replace(old_init, new_init)

    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
