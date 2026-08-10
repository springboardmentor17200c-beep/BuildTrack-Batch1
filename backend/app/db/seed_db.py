from app.db.database import SessionLocal
from app.models.role import Role
from app.models.company import Company
from app.models.user import User
from app.models.project import Project
from app.models.report import DBReport
from app.core.security import hash_password

def seed():
    db = SessionLocal()
    try:
        print("Seeding initial PostgreSQL data...")

        # 1. Seed Roles
        roles_data = [
            ("Administrator", "Has complete access to the BuildTrack platform."),
            ("Project Manager", "Responsible for planning and managing construction projects."),
            ("Site Engineer", "Monitors construction activities and submits progress reports."),
            ("Worker", "Construction workforce assigned to projects."),
            ("Client", "Represents the customer for whom the construction project is executed."),
            ("Contractor", "External contractor managing specialized site crews.")
        ]
        for name, desc in roles_data:
            existing = db.query(Role).filter(Role.role_name == name).first()
            if not existing:
                db.add(Role(role_name=name, description=desc))
        db.commit()

        # 2. Seed Companies
        company = db.query(Company).filter(Company.company_name == "BuildTrack Construction").first()
        if not company:
            company = Company(
                company_name="BuildTrack Construction",
                company_code="BT001",
                company_email="contact@buildtrack.com",
                company_phone="9876543210",
                address="Hyderabad, Telangana"
            )
            db.add(company)
            db.commit()
            db.refresh(company)

        # 3. Seed Sample Reports
        if db.query(DBReport).count() == 0:
            sample_reports = [
                DBReport(
                    file_name="Progress Report - Q3 2026",
                    report_type="progress",
                    file_path="/reports/progress_q3_2026.html"
                ),
                DBReport(
                    file_name="Budget Utilization Report - June 2026",
                    report_type="budget",
                    file_path="/reports/budget_june_2026.html"
                ),
                DBReport(
                    file_name="Resource Allocation Summary",
                    report_type="resource",
                    file_path="/reports/resource_summary.html"
                ),
                DBReport(
                    file_name="Workforce Performance Overview",
                    report_type="workforce",
                    file_path="/reports/workforce_overview.html"
                ),
                DBReport(
                    file_name="Procurement & Vendor Analysis",
                    report_type="procurement",
                    file_path="/reports/procurement_analysis.html"
                )
            ]
            db.add_all(sample_reports)
            db.commit()

        print("PostgreSQL seed completed successfully!")

    except Exception as e:
        db.rollback()
        print("Seed error:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed()
