import os

# Update auth.model.ts
model_path = 'frontend/buildtrack-frontend/src/app/features/auth/models/auth.model.ts'
with open(model_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'profileImage?: string;' not in content.split('export interface AppUser')[1]:
    content = content.replace('skillsOrTrade?: string;\n  }', 'skillsOrTrade?: string;\n    profileImage?: string;\n  }')
    with open(model_path, 'w', encoding='utf-8') as f:
        f.write(content)

# Update auth-data.service.ts
service_path = 'frontend/buildtrack-frontend/src/app/features/auth/auth-data.service.ts'
with open(service_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'profile_image?: string;' not in content:
    content = content.replace('created_at?: string;\n  }', 'created_at?: string;\n    profile_image?: string;\n  }')

if 'profileImage: u.profile_image,' not in content:
    content = content.replace('createdAt: u.created_at,\n    };', 'createdAt: u.created_at,\n      profileImage: u.profile_image,\n    };')

old_body = """    const body: Record<string, string> = {
      full_name: updates.fullName,
      phone_number: updates.phoneNumber,
    };"""

new_body = """    const body: Record<string, string> = {
      full_name: updates.fullName,
      phone_number: updates.phoneNumber,
    };
    if (updates.profileImage !== undefined) {
      body.profile_image = updates.profileImage;
    }"""

if 'body.profile_image = updates.profileImage' not in content:
    content = content.replace(old_body, new_body)

with open(service_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Frontend models updated.")
