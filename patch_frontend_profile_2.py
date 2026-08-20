import os

service_path = 'frontend/buildtrack-frontend/src/app/features/auth/auth-data.service.ts'
with open(service_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure profile_image is in BackendUserProfile
if 'profile_image?: string;' not in content:
    content = content.replace('created_at?: string;\n  }', 'created_at?: string;\n    profile_image?: string;\n  }')

# Make sure profileImage is parsed in toAppUser
old_toAppUser = """      isActive: u.is_active,
      createdAt: u.created_at,
    };"""

new_toAppUser = """      isActive: u.is_active,
      createdAt: u.created_at,
      profileImage: u.profile_image,
    };"""

if 'profileImage: u.profile_image' not in content:
    content = content.replace(old_toAppUser, new_toAppUser)

with open(service_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed toAppUser mapping.")
