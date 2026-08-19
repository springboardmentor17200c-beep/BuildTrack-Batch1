import os

schema_path = 'backend/app/schemas/user.py'
with open(schema_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Force replace inside UserResponse
old_str = """    is_active: bool | None = True
    created_at: datetime | None = None

    model_config = {"""

new_str = """    is_active: bool | None = True
    created_at: datetime | None = None
    profile_image: str | None = None

    model_config = {"""

content = content.replace(old_str, new_str)

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed UserResponse")
