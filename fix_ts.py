import re

with open('frontend/buildtrack-frontend/src/app/services/report.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'projectBudgets: data\.map\(d => \(\{.*?\}\)\)\n\s*\};', lambda m: m.group(0)[:-1] + ' as any;', content, flags=re.DOTALL)
content = re.sub(r'recentOrders: pos\.slice\(0, 5\)\.map\(\(po: any\) => \(\{.*?\}\)\)\n\s*\};', lambda m: m.group(0)[:-1] + ' as any;', content, flags=re.DOTALL)

with open('frontend/buildtrack-frontend/src/app/services/report.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)
