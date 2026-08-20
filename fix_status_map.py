import os
import re

analytics_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/analytics.py'
with open(analytics_path, 'r', encoding='utf-8') as f:
    analytics_content = f.read()

old_status = '"order_status": po.get("status", "Pending"),'

new_status = """            "order_status": "Delivered" if po.get("status") == "Delivered" else ("Confirmed" if po.get("status") == "Accepted" else ("Cancelled" if po.get("status") == "Rejected" else "Pending")),"""

analytics_content = analytics_content.replace(old_status, new_status)

with open(analytics_path, 'w', encoding='utf-8') as f:
    f.write(analytics_content)
