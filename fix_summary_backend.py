import os
import re

analytics_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/analytics.py'
with open(analytics_path, 'r', encoding='utf-8') as f:
    analytics_content = f.read()

old_summary_func = re.search(r"def get_analytics_summary\(.*?\):.*?return {\s*\"total_projects\": total_projects,\s*\"in_progress_projects\": in_progress,\s*\"avg_completion_percent\": avg_completion,\s*\"total_vendors\": vendors_count,\s*\"total_procurement_requests\": requests_count,\s*}", analytics_content, re.DOTALL).group(0)

new_summary_func = """def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    \"\"\"Top-level KPIs for the analytics hub.\"\"\"
    projects = db.query(Project).all()
    total_projects = len(projects)
    in_progress = sum(1 for p in projects if p.status and p.status.status_name == "In Progress")

    all_milestones = db.query(ProjectMilestone).all()
    total_m = len(all_milestones)
    done_m = sum(1 for m in all_milestones if m.status == "Completed")
    avg_completion = round((done_m / total_m) * 100) if total_m else 0

    vendors_count = db.query(Vendor).count()
    
    # Read from procurement store
    store_path = os.path.join(os.path.dirname(__file__), "..", "..", "procurement_store.json")
    try:
        with open(store_path, "r", encoding="utf-8") as f:
            import json
            store_data = json.load(f)
            requests_count = len(store_data.get("requests", {}))
    except Exception:
        requests_count = db.execute(text("SELECT COUNT(*) FROM procurement_requests")).scalar() or 0

    return {
        "total_projects": total_projects,
        "in_progress_projects": in_progress,
        "avg_completion_percent": avg_completion,
        "total_vendors": vendors_count,
        "total_procurement_requests": requests_count,
    }"""

analytics_content = analytics_content.replace(old_summary_func, new_summary_func)

with open(analytics_path, 'w', encoding='utf-8') as f:
    f.write(analytics_content)
