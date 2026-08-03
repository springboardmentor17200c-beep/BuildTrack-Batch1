from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.database import Base, engine

# Import all models before creating tables
from app.models import *
from app.models.inventory import MaterialCategory
from app.models.project_category import ProjectCategory
from app.models.project_status import ProjectStatus
from app.models.resource import ResourceCategory
from app.models.role import Role
from app.models.workforce import WorkforceCategory


LOOKUP_SEEDS = {
    Role: [
        ("Administrator", "Full company administration access."),
        ("Project Manager", "Manages projects, milestones, resources, and teams."),
        ("Site Engineer", "Tracks site progress, resources, inventory, and workforce."),
        ("Contractor", "Coordinates assigned workforce and material requests."),
        ("Worker", "Performs assigned site work.")
    ],
    ProjectCategory: [
        ("Residential", "Residential construction projects."),
        ("Commercial", "Commercial construction projects."),
        ("Industrial", "Industrial construction projects."),
        ("Infrastructure", "Infrastructure construction projects."),
        ("Government Projects", "Government and public-sector projects."),
    ],
    ProjectStatus: [
        ("Planned", "Project is planned and not yet active."),
        ("In Progress", "Project execution is active."),
        ("On Hold", "Project is temporarily paused."),
        ("Completed", "Project deliverables are completed."),
        ("Closed", "Project is administratively closed."),
    ],
    ResourceCategory: [
        ("Excavators", "Earth moving equipment."),
        ("Concrete Mixers", "Concrete preparation equipment."),
        ("Cranes", "Lifting equipment."),
        ("Dump Trucks", "Hauling equipment."),
        ("Generators", "Power equipment."),
        ("Safety Equipment", "Safety and compliance equipment."),
    ],
    MaterialCategory: [
        ("Cement", "Cement materials."),
        ("Steel", "Steel and reinforcement materials."),
        ("Bricks", "Brick materials."),
        ("Sand", "Sand and aggregates."),
        ("Concrete", "Concrete materials."),
        ("Electrical Materials", "Electrical construction materials."),
        ("Plumbing Materials", "Plumbing construction materials."),
    ],
    WorkforceCategory: [
        ("Engineers", "Engineering staff."),
        ("Supervisors", "Site supervision staff."),
        ("Contractors", "Contractor workforce."),
        ("Skilled Workers", "Skilled labor."),
        ("Unskilled Workers", "General labor."),
        ("Consultants", "External consultants."),
    ],
}


def _ensure_postgres_schema() -> None:
    if not engine.url.drivername.startswith("postgresql"):
        return

    with engine.begin() as connection:
        connection.execute(text("CREATE SCHEMA IF NOT EXISTS buildtrack"))


def seed_lookup_data(db: Session) -> None:
    for model, rows in LOOKUP_SEEDS.items():
        for name, description in rows:
            exists = (
                db.query(model)
                .filter(model.category_name == name if hasattr(model, "category_name") else model.role_name == name if hasattr(model, "role_name") else model.status_name == name)
                .first()
            )

            if exists:
                continue

            if hasattr(model, "role_name"):
                db.add(model(role_name=name, description=description))
            elif hasattr(model, "status_name"):
                db.add(model(status_name=name, description=description))
            else:
                db.add(model(category_name=name, description=description))

    db.commit()


def init_db():
    _ensure_postgres_schema()
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        seed_lookup_data(db)


if __name__ == "__main__":
    try:
        init_db()
        print("BuildTrack database initialized.")
    except SQLAlchemyError as exc:
        raise SystemExit(f"Database initialization failed: {exc}") from exc
