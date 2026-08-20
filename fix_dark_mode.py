import os

theme_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/shared/bt-theme.css'

with open(theme_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace :host-context(.bt-dark) with body.bt-dark
css = css.replace(':host-context(.bt-dark)', 'body.bt-dark')

with open(theme_path, 'w', encoding='utf-8') as f:
    f.write(css)
