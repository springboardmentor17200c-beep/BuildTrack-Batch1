"""
Seed real projects and related data into the BuildTrack database.
"""
from app.db.database import SessionLocal
from app.models.project import Project
from app.models.project_status import ProjectStatus
from app.models.project_category import ProjectCategory
from app.models.project_milestone import ProjectMilestone
from app.models.procurement_request import ProcurementRequest
from app.models.workforce import EmployeeProfile, WorkforceCategory, Attendance
from app.models.user import User
from app.models.role import Role
from datetime import date, datetime

db = SessionLocal()

print("Seeding reference data...")

# 1. Project Statuses
statuses = [
    ProjectStatus(status_name="Planning"),
    ProjectStatus(status_name="In Progress"),
    ProjectStatus(status_name="On Hold"),
    ProjectStatus(status_name="Completed"),
    ProjectStatus(status_name="Cancelled"),
]
db.add_all(statuses)
db.commit()
for s in db.query(ProjectStatus).all():
    print(f"  Status: id={s.status_id} name={s.status_name}")

# 2. Project Categories
categories = [
    ProjectCategory(category_name="Residential"),
    ProjectCategory(category_name="Commercial"),
    ProjectCategory(category_name="Industrial"),
    ProjectCategory(category_name="Infrastructure"),
]
db.add_all(categories)
db.commit()
for c in db.query(ProjectCategory).all():
    print(f"  Category: id={c.category_id} name={c.category_name}")

# 3. Get references
status_in_progress = db.query(ProjectStatus).filter(ProjectStatus.status_name == "In Progress").first()
status_planning = db.query(ProjectStatus).filter(ProjectStatus.status_name == "Planning").first()
cat_residential = db.query(ProjectCategory).filter(ProjectCategory.category_name == "Residential").first()
cat_commercial = db.query(ProjectCategory).filter(ProjectCategory.category_name == "Commercial").first()

admin_user = db.query(User).filter(User.email == "admin@buildtrack.com").first()
pm_user = db.query(User).filter(User.email == "afsa@buildtrack.com").first()
client_user = db.query(User).filter(User.email == "client@buildtrack.com").first()

if not client_user:
    # Create a client user
    from app.core.security import hash_password
    client_role = db.query(Role).filter(Role.role_name == "Client / Owner").first()
    client_user = User(
        full_name="Test Client",
        email="client@buildtrack.com",
        username="client",
        phone_number="9000000001",
        role_id=client_role.role_id if client_role else None,
        company_id=1,
        password_hash=hash_password("Admin@1234")
    )
    db.add(client_user)
    db.commit()
    print(f"  Created client user: {client_user.user_id}")

print("\nSeeding projects...")

# 4. Projects
project1 = Project(
    company_id=1,
    project_name="Skyline Residency Tower",
    description="A 25-storey residential tower with 200 units.",
    location="Karachi, Pakistan",
    start_date=date(2026, 1, 15),
    expected_end_date=date(2027, 6, 30),
    status_id=status_in_progress.status_id,
    category_id=cat_residential.category_id,
    manager_id=pm_user.user_id,
    client_id=client_user.user_id,
)
db.add(project1)
db.commit()
db.refresh(project1)
print(f"  Created Project: id={project1.project_id} name='{project1.project_name}'")

project2 = Project(
    company_id=1,
    project_name="Riverside Business Park",
    description="A 5-block commercial complex with offices and retail.",
    location="Lahore, Pakistan",
    start_date=date(2026, 3, 1),
    expected_end_date=date(2027, 12, 31),
    status_id=status_planning.status_id,
    category_id=cat_commercial.category_id,
    manager_id=admin_user.user_id,
    client_id=client_user.user_id,
)
db.add(project2)
db.commit()
db.refresh(project2)
print(f"  Created Project: id={project2.project_id} name='{project2.project_name}'")

print("\nSeeding milestones...")

milestones = [
    ProjectMilestone(project_id=project1.project_id, milestone_name="Foundation Complete",
                     due_date=date(2026, 3, 30), status="Completed"),
    ProjectMilestone(project_id=project1.project_id, milestone_name="Ground Floor Slab",
                     due_date=date(2026, 5, 15), status="Completed"),
    ProjectMilestone(project_id=project1.project_id, milestone_name="5th Floor Structure",
                     due_date=date(2026, 7, 31), status="In Progress"),
    ProjectMilestone(project_id=project1.project_id, milestone_name="10th Floor Structure",
                     due_date=date(2026, 10, 15), status="Pending"),
    ProjectMilestone(project_id=project1.project_id, milestone_name="MEP Works Completion",
                     due_date=date(2027, 2, 28), status="Pending"),
    ProjectMilestone(project_id=project2.project_id, milestone_name="Site Clearance",
                     due_date=date(2026, 4, 15), status="Completed"),
    ProjectMilestone(project_id=project2.project_id, milestone_name="Foundation Design Approved",
                     due_date=date(2026, 5, 30), status="In Progress"),
]
db.add_all(milestones)
db.commit()
print(f"  Created {len(milestones)} milestones")

print("\nSeeding procurement requests...")

procurement_requests = [
    ProcurementRequest(project_id=project1.project_id, requested_by=pm_user.user_id,
                       request_type="Material", description="OPC 53 Grade Cement - 5000 bags",
                       request_status="Approved"),
    ProcurementRequest(project_id=project1.project_id, requested_by=pm_user.user_id,
                       request_type="Material", description="TMT Steel Bars - 200 tons",
                       request_status="Pending"),
    ProcurementRequest(project_id=project1.project_id, requested_by=admin_user.user_id,
                       request_type="Equipment", description="Tower Crane rental for 12 months",
                       request_status="Approved"),
    ProcurementRequest(project_id=project2.project_id, requested_by=admin_user.user_id,
                       request_type="Material", description="Ready Mix Concrete - 1000 cubic meters",
                       request_status="Pending"),
]
db.add_all(procurement_requests)
db.commit()
print(f"  Created {len(procurement_requests)} procurement requests")

print("\nSeeding workforce data...")

# Workforce categories
wf_cats = [
    WorkforceCategory(category_name="Civil Engineer"),
    WorkforceCategory(category_name="Site Supervisor"),
    WorkforceCategory(category_name="Mason"),
    WorkforceCategory(category_name="Electrician"),
]
db.add_all(wf_cats)
db.commit()
civil_cat = db.query(WorkforceCategory).filter(WorkforceCategory.category_name == "Civil Engineer").first()
mason_cat = db.query(WorkforceCategory).filter(WorkforceCategory.category_name == "Mason").first()

# Employee profiles on project1
site_eng = db.query(User).filter(User.email == "amna@buildtrack.com").first()
site_eng2 = db.query(User).filter(User.email == "malik@buildtrack.com").first()

emp1 = EmployeeProfile(
    user_id=site_eng.user_id, workforce_category_id=civil_cat.workforce_category_id,
    project_id=project1.project_id, employee_code="EMP-001",
    joining_date=date(2026, 1, 20), experience_years=5.0,
    pay_rate=85000, payment_type="Monthly", employment_status="Active"
)
db.add(emp1)
db.commit()
db.refresh(emp1)
print(f"  Employee {site_eng.email} on project {project1.project_id}")

emp2 = EmployeeProfile(
    user_id=site_eng2.user_id, workforce_category_id=mason_cat.workforce_category_id,
    project_id=project1.project_id, employee_code="EMP-002",
    joining_date=date(2026, 2, 1), experience_years=8.0,
    pay_rate=60000, payment_type="Monthly", employment_status="Active"
)
db.add(emp2)
db.commit()
db.refresh(emp2)
print(f"  Employee {site_eng2.email} on project {project1.project_id}")

# Attendance records
attendance_records = [
    Attendance(employee_id=emp1.employee_id, project_id=project1.project_id,
               attendance_date=date(2026, 8, 1), attendance_status="Present"),
    Attendance(employee_id=emp1.employee_id, project_id=project1.project_id,
               attendance_date=date(2026, 8, 4), attendance_status="Present"),
    Attendance(employee_id=emp1.employee_id, project_id=project1.project_id,
               attendance_date=date(2026, 8, 5), attendance_status="Absent"),
    Attendance(employee_id=emp2.employee_id, project_id=project1.project_id,
               attendance_date=date(2026, 8, 1), attendance_status="Present"),
    Attendance(employee_id=emp2.employee_id, project_id=project1.project_id,
               attendance_date=date(2026, 8, 4), attendance_status="Half Day"),
    Attendance(employee_id=emp2.employee_id, project_id=project1.project_id,
               attendance_date=date(2026, 8, 5), attendance_status="Present"),
]
db.add_all(attendance_records)
db.commit()
print(f"  Created {len(attendance_records)} attendance records")

print("\nDone! Seeding complete.")
print(f"  Project 1 ID: {project1.project_id} - {project1.project_name}")
print(f"  Project 2 ID: {project2.project_id} - {project2.project_name}")
db.close()
