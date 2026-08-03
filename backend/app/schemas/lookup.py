from pydantic import BaseModel


class LookupItem(BaseModel):
    id: int
    name: str
    description: str | None = None


class LookupResponse(BaseModel):
    roles: list[LookupItem]
    project_categories: list[LookupItem]
    project_statuses: list[LookupItem]
    resource_categories: list[LookupItem]
    material_categories: list[LookupItem]
    workforce_categories: list[LookupItem]
