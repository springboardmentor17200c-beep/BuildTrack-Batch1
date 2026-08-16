import requests

BASE = "http://127.0.0.1:8000"

# ── Get a token ──────────────────────────────────────────────
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from app.core.security import create_access_token
TOKEN = create_access_token(data={"sub": "admin@buildtrack.com"})
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

PASS = "\033[92m✅ PASS\033[0m"
FAIL = "\033[91m❌ FAIL\033[0m"

def test(label, method, path, *, json=None, expected_status=None):
    url = BASE + path
    r = getattr(requests, method)(url, headers=HEADERS, json=json)
    status_ok = expected_status is None or r.status_code == expected_status
    mark = PASS if status_ok else FAIL
    print(f"{mark}  [{r.status_code}] {method.upper()} {path}")
    try:
        body = r.json()
        if isinstance(body, list):
            print(f"       → list with {len(body)} item(s)")
        else:
            print(f"       → {body}")
    except Exception:
        print(f"       → (no JSON body)")
    return r

print("\n========== MATERIALS ==========")
test("GET /materials/", "get", "/materials/", expected_status=200)

r = test("POST /materials/", "post", "/materials/",
         json={"company_id": 1, "material_name": "Test Cement", "unit": "bags"},
         expected_status=201)
material_id = r.json().get("material_id") if r.status_code == 201 else None

if material_id:
    test("GET /materials/{id}", "get", f"/materials/{material_id}", expected_status=200)
    test("PUT /materials/{id}", "put", f"/materials/{material_id}",
         json={"material_name": "Test Cement Updated", "unit": "bags"},
         expected_status=200)

print("\n========== INVENTORY ==========")

# first need a valid project_id
import requests as req
projects_r = req.get(BASE + "/projects/", headers=HEADERS)
projects = projects_r.json() if projects_r.status_code == 200 else []
project_id = projects[0]["project_id"] if projects else 1

test("GET /inventory/project/{id}", "get", f"/inventory/project/{project_id}", expected_status=200)

if material_id:
    r2 = test("POST /inventory/", "post", "/inventory/",
              json={
                  "project_id": project_id,
                  "material_id": material_id,
                  "quantity_available": "100.00",
                  "minimum_quantity": "10.00",
                  "location_note": "Site A - warehouse"
              },
              expected_status=201)
    inv_id = r2.json().get("inventory_id") if r2.status_code == 201 else None

    if inv_id:
        test("GET /inventory/{id}", "get", f"/inventory/{inv_id}", expected_status=200)
        test("PUT /inventory/{id}", "put", f"/inventory/{inv_id}",
             json={"quantity_available": "80.00", "location_note": "Site A - updated"},
             expected_status=200)
        test("DELETE /inventory/{id}", "delete", f"/inventory/{inv_id}", expected_status=204)

if material_id:
    test("DELETE /materials/{id}", "delete", f"/materials/{material_id}", expected_status=204)

print("\n========== DUPLICATE CHECK ==========")
r3 = test("POST /materials/ (duplicate)", "post", "/materials/",
          json={"company_id": 1, "material_name": "Test Cement", "unit": "bags"},
          expected_status=201)
mat2_id = r3.json().get("material_id") if r3.status_code == 201 else None
if mat2_id:
    r4 = test("POST /materials/ (duplicate again)", "post", "/materials/",
              json={"company_id": 1, "material_name": "Test Cement", "unit": "bags"},
              expected_status=409)
    # cleanup
    requests.delete(BASE + f"/materials/{mat2_id}", headers=HEADERS)

print("\nDone.")
