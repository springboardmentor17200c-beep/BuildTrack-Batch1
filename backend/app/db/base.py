from app.db.database import Base

# Import all models so SQLAlchemy registers them
from app.models.client import Client
from app.models.company import Company
from app.models.inventory import (
    Inventory,
    InventoryTransaction,
    Material,
    MaterialCategory,
    MaterialRequest,
)
from app.models.project import Project
from app.models.project_category import ProjectCategory
from app.models.project_milestone import ProjectMilestone
from app.models.project_status import ProjectStatus
from app.models.resource import (
    MaintenanceRecord,
    Resource,
    ResourceAllocation,
    ResourceCategory,
)
from app.models.role import Role
from app.models.user import User
from app.models.workforce import (
    EmployeeProfile,
    WorkforceCategory,
)
