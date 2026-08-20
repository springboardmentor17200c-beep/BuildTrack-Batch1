import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/milestone-tracking/milestone-tracking.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

input_box = """          <label>
            <span>Progress Weight (%)</span>
            <input type="number" formControlName="progressPercentage" min="0" max="100" placeholder="e.g. 25" />
          </label>
        </div>"""

html_content = html_content.replace(
    '        </div>\n        <label class="bt-auth-field" style="margin-top:16px;">',
    input_box + '\n        <label class="bt-auth-field" style="margin-top:16px;">'
)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
