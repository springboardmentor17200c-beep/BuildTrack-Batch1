import os

wf_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/workforce.py'
with open(wf_path, 'r', encoding='utf-8') as f:
    wf_content = f.read()

# Add imports
imports = """from app.models.user import User
from app.core.security import get_password_hash
from app.models.role import Role"""
wf_content = wf_content.replace("from app.models.user import User", imports)

old_user_creation = """    # Resolve or create User
    user_id = payload.user_id
    if not user_id and payload.full_name:
        ts = int(datetime.utcnow().timestamp())
        fake_email = f"{payload.full_name.lower().replace(' ', '')}{ts}@buildtrack.local"
        user = User(
            full_name=payload.full_name,
            email=fake_email,
            password_hash="N/A",
            phone_number="N/A"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.user_id"""

new_user_creation = """    # Resolve or create User
    user_id = payload.user_id
    if not user_id and payload.full_name:
        # Check if username exists
        existing_user = db.query(User).filter(User.username == payload.employee_code).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User ID already exists.")
            
        worker_role = db.query(Role).filter(Role.role_name == "Worker").first()
        role_id = worker_role.role_id if worker_role else None
        
        user = User(
            full_name=payload.full_name,
            username=payload.employee_code,
            email=f"{payload.employee_code}@buildtrack.local",
            password_hash=get_password_hash("12345t"),
            phone_number="N/A", # Will be updated later
            role_id=role_id,
            company_id=current_user.company_id if current_user else 1
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.user_id"""

wf_content = wf_content.replace(old_user_creation, new_user_creation)

with open(wf_path, 'w', encoding='utf-8') as f:
    f.write(wf_content)
