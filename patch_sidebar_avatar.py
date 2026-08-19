import os

filepath = 'frontend/buildtrack-frontend/src/app/features/shared/sidebar/app-sidebar.component.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_avatar = """        <div class="bt-stat-icon blue" style="width:34px;height:34px;">{{ currentUser.fullName.charAt(0) }}</div>"""
new_avatar = """        <div class="bt-stat-icon blue" style="width:34px;height:34px;overflow:hidden;padding:0;">
          <img *ngIf="currentUser.profileImage" [src]="currentUser.profileImage" style="width:100%;height:100%;object-fit:cover;" />
          <span *ngIf="!currentUser.profileImage">{{ currentUser.fullName.charAt(0) }}</span>
        </div>"""

if 'currentUser.profileImage' not in content:
    content = content.replace(old_avatar, new_avatar)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
