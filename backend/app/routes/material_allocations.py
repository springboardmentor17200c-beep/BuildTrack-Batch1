import os
import json
from fastapi import APIRouter

router = APIRouter(prefix="/material-allocations", tags=["Material Allocations"])

STORE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "material_allocations.json")

def load_store():
    if not os.path.exists(STORE_PATH):
        return []
    try:
        with open(STORE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_store(data):
    with open(STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

@router.get("")
def get_allocations():
    return load_store()

@router.post("")
def create_allocation(allocation: dict):
    store = load_store()
    store.insert(0, allocation)
    save_store(store)
    return allocation

@router.patch("/{allocation_id}")
def update_allocation(allocation_id: str, updates: dict):
    store = load_store()
    for item in store:
        if item.get("allocationId") == allocation_id:
            item.update(updates)
            save_store(store)
            return item
    return {"error": "not found"}
