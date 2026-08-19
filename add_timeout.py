import os
import re

filepath = 'frontend/buildtrack-frontend/src/app/services/report.service.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure timeout is imported from rxjs
if 'timeout' not in content[:content.find('export class')]:
    content = content.replace('import { Observable, of, delay, catchError, map } from \'rxjs\';', 'import { Observable, of, delay, catchError, map, timeout } from \'rxjs\';')

# Add timeout to all http calls in report.service.ts
# fetchProgressReportData
content = re.sub(
    r"(this\.http\.get<any\[\]>\('[^']+', { headers: this\.headers\(\) }\))\.pipe\(",
    r"\1.pipe(\n      timeout(3000),",
    content
)

content = re.sub(
    r"(this\.http\.get<any>\('[^']+', { headers: this\.headers\(\) }\))\.pipe\(",
    r"\1.pipe(\n      timeout(3000),",
    content
)

content = re.sub(
    r"(this\.http\.post<Report>\(this\.apiUrl, { type, title, filter }, { headers: this\.headers\(\) }\))\.pipe\(",
    r"\1.pipe(\n          timeout(3000),",
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
