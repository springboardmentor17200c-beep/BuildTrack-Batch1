import os
import re

service_path = 'frontend/buildtrack-frontend/src/app/features/auth/auth-data.service.ts'
with open(service_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure profile_image is in BackendUserProfile
if 'profile_image?: string;' not in content:
    content = re.sub(r'created_at\?: string;[ \t\r\n]*}', 'created_at?: string;\n    profile_image?: string;\n  }', content)

# Make sure profileImage is parsed in toAppUser
if 'profileImage: u.profile_image' not in content:
    content = re.sub(r'createdAt: u\.created_at,?[ \t\r\n]*};', 'createdAt: u.created_at,\n      profileImage: u.profile_image,\n    };', content)

with open(service_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed toAppUser mapping.")
