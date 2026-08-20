import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/shared/sidebar/app-sidebar.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

old_nav = """  <nav class="bt-sidebar-nav">
    <a *ngFor="let item of navItems" class="bt-sidebar-link" [class.locked]="!isAllowed(item)" [routerLink]="[item.route]" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }">"""

new_nav = """  <nav class="bt-sidebar-nav">
    <ng-container *ngFor="let item of navItems">
    <a *ngIf="!(currentUser?.role === 'Worker' && !isAllowed(item))" class="bt-sidebar-link" [class.locked]="!isAllowed(item)" [routerLink]="[item.route]" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }">"""

old_nav_end = """      </svg>
    </a>
  </nav>"""

new_nav_end = """      </svg>
    </a>
    </ng-container>
  </nav>"""

html_content = html_content.replace(old_nav, new_nav)
html_content = html_content.replace(old_nav_end, new_nav_end)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
