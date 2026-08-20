import os

model_path = 'frontend/buildtrack-frontend/src/app/features/auth/models/auth.model.ts'
with open(model_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_appuser = """    createdAt?: string;
  }"""

new_appuser = """    createdAt?: string;
    profileImage?: string;
  }"""

content = content.replace(old_appuser, new_appuser)

with open(model_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix TS4111 in auth-data.service.ts
service_path = 'frontend/buildtrack-frontend/src/app/features/auth/auth-data.service.ts'
with open(service_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('body.profile_image = updates.profileImage;', 'body[\'profile_image\'] = updates.profileImage;')

with open(service_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed")
