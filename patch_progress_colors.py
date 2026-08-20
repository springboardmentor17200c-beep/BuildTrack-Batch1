import os
import re

filepath = 'frontend/buildtrack-frontend/src/app/features/shared/bt-theme.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add .gray and .purple for the first definition
first_defs = """.bt-progress-fill.red { background: linear-gradient(90deg, var(--bt-red), #f87171); box-shadow: var(--bt-glow-red); }
.bt-progress-fill.gray { background: linear-gradient(90deg, #94a3b8, #cbd5e1); }
.bt-progress-fill.purple { background: linear-gradient(90deg, var(--bt-purple), #c084fc); box-shadow: var(--bt-glow-purple); }"""
content = content.replace('.bt-progress-fill.red { background: linear-gradient(90deg, var(--bt-red), #f87171); box-shadow: var(--bt-glow-red); }', first_defs)

# Add .gray and .purple for the second definition (if it exists)
second_defs = """.bt-progress-fill.red { background: var(--bt-red); }
.bt-progress-fill.gray { background: #94a3b8; }
.bt-progress-fill.purple { background: var(--bt-purple); }"""
if '.bt-progress-fill.red { background: var(--bt-red); }' in content:
    content = content.replace('.bt-progress-fill.red { background: var(--bt-red); }', second_defs)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
