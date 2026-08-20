import os

# 1. Update UserResponse in backend/app/schemas/user.py
schema_path = 'backend/app/schemas/user.py'
with open(schema_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'profile_image: str | None = None' not in content:
    content = content.replace('created_at: datetime | None = None', 'created_at: datetime | None = None\n    profile_image: str | None = None')
    with open(schema_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Update build_user_response in backend/app/routes/auth.py
auth_path = 'backend/app/routes/auth.py'
with open(auth_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_response = """        is_active=bool(user.is_active) if user.is_active is not None else True,
        created_at=user.created_at,
    )"""

new_response = """        is_active=bool(user.is_active) if user.is_active is not None else True,
        created_at=user.created_at,
        profile_image=user.profile_image,
    )"""

if 'profile_image=user.profile_image' not in content:
    content = content.replace(old_response, new_response)
    with open(auth_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Backend files updated.")
