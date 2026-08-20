import os

filepath = 'frontend/buildtrack-frontend/src/app/models/components/analytics/report-generator.component.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('generate(type: ReportType) {', 'generate(type: ReportType) {\n    alert("Clicked: " + type);')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
