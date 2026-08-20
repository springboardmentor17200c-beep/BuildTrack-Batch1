import os
import re

### 1. Update analytics.py
analytics_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/analytics.py'
with open(analytics_path, 'r', encoding='utf-8') as f:
    analytics_content = f.read()

# Replace the progress calculation
old_calc = """        total = len(milestones)
        completed = sum(1 for m in milestones if m.status == "Completed")
        completion_pct = round((completed / total) * 100) if total else 0"""

new_calc = """        total = len(milestones)
        completed = sum(1 for m in milestones if m.status == "Completed")
        # Sum the percentage weight of all completed milestones
        completion_pct = sum((m.progress_percentage or 0) for m in milestones if m.status == "Completed")
        # Cap at 100
        completion_pct = min(100, completion_pct)"""

analytics_content = analytics_content.replace(old_calc, new_calc)

with open(analytics_path, 'w', encoding='utf-8') as f:
    f.write(analytics_content)


### 2. Update project_milestone.py
route_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/project_milestone.py'
with open(route_path, 'r', encoding='utf-8') as f:
    route_content = f.read()

# We need to add auto-completion logic whenever a milestone is created or updated
auto_complete_logic = """
    # --- Auto-Completion Logic ---
    # Recalculate total project progress
    all_milestones = db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project.project_id).all()
    total_progress = sum((m.progress_percentage or 0) for m in all_milestones if m.status == "Completed")
    
    if total_progress >= 100 and project.status and project.status.status_name != "Completed":
        # Find 'Completed' status ID
        from app.models.project_status import ProjectStatus
        completed_status = db.query(ProjectStatus).filter(ProjectStatus.status_name == "Completed").first()
        if completed_status:
            project.status_id = completed_status.status_id
            import datetime
            project.actual_end_date = datetime.date.today()
"""

# Insert into create_milestone before db.commit()
if "# --- Auto-Completion Logic ---" not in route_content:
    route_content = route_content.replace(
        "    db.commit()\n    db.refresh(new_milestone)",
        auto_complete_logic + "\n    db.commit()\n    db.refresh(new_milestone)"
    )

    # Insert into update_milestone before db.commit()
    # Wait, update_milestone doesn't have `project` variable initialized easily. Let's do it by fetching project.
    update_auto_complete = """
    project = db.query(Project).filter(Project.project_id == milestone.project_id).first()
    if project:
""" + auto_complete_logic.replace("project.", "project.").replace("    ", "        ")

    route_content = route_content.replace(
        "    db.commit()\n    db.refresh(milestone)",
        update_auto_complete + "\n    db.commit()\n    db.refresh(milestone)"
    )

with open(route_path, 'w', encoding='utf-8') as f:
    f.write(route_content)

