import os

analytics_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/analytics.py'
with open(analytics_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == 'import json' or line.strip() == 'import os':
        continue
    new_lines.append(line)

new_lines.insert(5, "import json\nimport os\n")

with open(analytics_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
