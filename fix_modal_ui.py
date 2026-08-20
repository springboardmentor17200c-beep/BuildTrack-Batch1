import os
import re

def clean_html(path):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Add color to h3 modal headers
    html = html.replace('<h3 style="margin: 0; font-size: 20px; font-weight: 700;">', 
                        '<h3 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--bt-text);">')

    # Fix modal inline style override of grid
    html = html.replace('class="bt-form-grid" style="display: flex; flex-direction: column; gap: 16px;"', 'class="bt-form-grid"')

    # Fix labels to avoid inline styles since .bt-form-grid label already handles it
    html = html.replace('style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--bt-muted);"', '')
    html = html.replace('style="flex: 1; display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--bt-muted);"', 'style="flex: 1;"')

    # Remove inline styles from inputs, selects, and textareas
    # Use regex to strip out the style attribute entirely from these
    html = re.sub(r'<select style="[^"]*">', '<select>', html)
    html = re.sub(r'<input type="text" placeholder="([^"]*)" style="[^"]*">', r'<input type="text" placeholder="\1">', html)
    html = re.sub(r'<input type="number" placeholder="([^"]*)" style="[^"]*">', r'<input type="number" placeholder="\1">', html)
    html = re.sub(r'<input type="date" style="[^"]*">', '<input type="date">', html)
    html = re.sub(r'<textarea rows="3" \[\(ngModel\)\]="([^"]*)" placeholder="([^"]*)" style="[^"]*"></textarea>', r'<textarea rows="3" [(ngModel)]="\1" placeholder="\2"></textarea>', html)
    html = re.sub(r'<input type="text" \[\(ngModel\)\]="([^"]*)" placeholder="([^"]*)" style="[^"]*">', r'<input type="text" [(ngModel)]="\1" placeholder="\2">', html)

    # In maintenance-scheduling, there's `<span>Estimated Cost (?)</span>` which is weird because of encoding.
    html = html.replace('Estimated Cost (?)', 'Estimated Cost (₹)')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)


p1 = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/maintenance-scheduling/maintenance-scheduling.component.html'
p2 = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-categories/resource-categories.component.html'

clean_html(p1)
clean_html(p2)
