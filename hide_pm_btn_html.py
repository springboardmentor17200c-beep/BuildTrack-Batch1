import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/project-listing/project-listing.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

old_actions = '        <div class="bt-actions">'
new_actions = '        <div class="bt-actions" *ngIf="canCreateProject">'

if old_actions in html_content:
    html_content = html_content.replace(old_actions, new_actions)
else:
    print("Could not find bt-actions")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
