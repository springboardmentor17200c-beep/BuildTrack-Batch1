import os
import re

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/projects-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# 1. Import AnalyticsDataService
import_stmt = "import { AnalyticsDataService } from '../analytics/analytics-data.service';\n"
if "AnalyticsDataService" not in ts_content:
    ts_content = ts_content.replace(
        "import { Injectable } from '@angular/core';",
        "import { Injectable } from '@angular/core';\n" + import_stmt
    )

# 2. Inject it
if "private analytics: AnalyticsDataService" not in ts_content:
    ts_content = ts_content.replace(
        "constructor(private http: HttpClient) {",
        "constructor(private http: HttpClient, private analytics: AnalyticsDataService) {"
    )

# 3. Call analytics.loadAll() in addMilestone success
add_pattern = r"next: \(\) => this\.loadAll\(\),"
add_replace = "next: () => { this.loadAll(); this.analytics.loadAll(); },"
ts_content = re.sub(add_pattern, add_replace, ts_content)

# 4. Call analytics.loadAll() in markMilestoneStatus success
# Original: .subscribe(() => this.loadAll());
mark_pattern = r"\.subscribe\(\(\) => this\.loadAll\(\)\);"
mark_replace = ".subscribe(() => { this.loadAll(); this.analytics.loadAll(); });"
ts_content = re.sub(mark_pattern, mark_replace, ts_content)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
