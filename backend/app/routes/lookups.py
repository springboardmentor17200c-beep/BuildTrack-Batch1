from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.inventory import MaterialCategory
from app.models.project_category import ProjectCategory
from app.models.project_status import ProjectStatus
from app.models.resource import ResourceCategory
from app.models.role import Role
from app.models.workforce import WorkforceCategory
from app.schemas.lookup import LookupItem, LookupResponse

router = APIRouter(
    prefix="/lookups",
    tags=["Lookup Data"],
)


def _items(rows, id_attr: str, name_attr: str) -> list[LookupItem]:
    return [
        LookupItem(
            id=getattr(row, id_attr),
            name=getattr(row, name_attr),
            description=row.description,
        )
        for row in rows
    ]


@router.get("", response_model=LookupResponse)
def get_lookups(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return LookupResponse(
        roles=_items(db.query(Role).order_by(Role.role_name).all(), "role_id", "role_name"),
        project_categories=_items(
            db.query(ProjectCategory).order_by(ProjectCategory.category_name).all(),
            "category_id",
            "category_name",
        ),
        project_statuses=_items(
            db.query(ProjectStatus).order_by(ProjectStatus.status_name).all(),
            "status_id",
            "status_name",
        ),
        resource_categories=_items(
            db.query(ResourceCategory).order_by(ResourceCategory.category_name).all(),
            "resource_category_id",
            "category_name",
        ),
        material_categories=_items(
            db.query(MaterialCategory).order_by(MaterialCategory.category_name).all(),
            "material_category_id",
            "category_name",
        ),
        workforce_categories=_items(
            db.query(WorkforceCategory).order_by(WorkforceCategory.category_name).all(),
            "workforce_category_id",
            "category_name",
        ),
    )
