import os
import re

auth_service_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/auth/auth-data.service.ts'

with open(auth_service_path, 'r', encoding='utf-8') as f:
    auth_content = f.read()

# Replace the incorrect map method
auth_content = auth_content.replace(
    "map(users => users.map(u => this.mapBackendUserToAppUser(u)))",
    "map(users => users.map(toAppUser))"
)

with open(auth_service_path, 'w', encoding='utf-8') as f:
    f.write(auth_content)
