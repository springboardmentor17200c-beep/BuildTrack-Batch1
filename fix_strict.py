import os
import glob

html_files = glob.glob('C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/*/*.html')

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix strict type errors
    content = content.replace("p.project || p.projectName", "p.project")
    content = content.replace("p.completionPercentage || p.completion_percentage || 0", "p.completionPercentage || 0")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
