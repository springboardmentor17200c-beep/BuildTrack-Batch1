"""
End-to-End Test Script for BuildTrack
Tests each role's access and project report generation
"""
import requests
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://127.0.0.1:8000"
PASSWORD = "Admin@1234"

ROLES = [
    {"email": "admin@buildtrack.com",  "label": "Administrator"},
    {"email": "afsa@buildtrack.com",   "label": "Project Manager"},
    {"email": "amna@buildtrack.com",   "label": "Site Engineer"},
    {"email": "sarala@buildtrack.com", "label": "Project Manager (sarala)"},
]

def login(email, password=PASSWORD):
    r = requests.post(f"{BASE}/auth/login", data={"username": email, "password": password})
    if r.status_code == 200:
        return r.json().get("access_token")
    print(f"  FAIL Login for {email}: {r.status_code} {r.text[:150]}")
    return None

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}

def run_tests():
    results = []

    print("=" * 60)
    print("  BuildTrack End-to-End Role & Report Test")
    print("=" * 60)

    for role_info in ROLES:
        email = role_info["email"]
        label = role_info["label"]
        print(f"\n{'-'*60}")
        print(f"  ROLE: {label} ({email})")
        print(f"{'-'*60}")

        token = login(email)
        if not token:
            results.append({"role": label, "login": "FAIL"})
            continue

        print(f"  [OK] Login")
        headers = auth_headers(token)

        # 1. Get current user
        r = requests.get(f"{BASE}/auth/me", headers=headers)
        me = r.json() if r.status_code == 200 else {}
        print(f"  [{'OK' if r.status_code==200 else 'FAIL'}] /auth/me -> {r.status_code} | user_id={me.get('user_id')} role={me.get('role')}")

        # 2. Get Projects (only Admin/PM can)
        r = requests.get(f"{BASE}/projects", headers=headers)
        projects = r.json() if r.status_code == 200 else []
        print(f"  [{'OK' if r.status_code==200 else 'SKIP'}] /projects -> {r.status_code} | count={len(projects) if isinstance(projects, list) else 'N/A'}")

        # 3. Try generating comprehensive report for project 1
        project_id = 1
        project_name = "Unknown"
        if projects and isinstance(projects, list) and len(projects) > 0:
            project_id = projects[0].get("project_id", 1)
            project_name = projects[0].get("project_name", "Unknown")

        print(f"\n  Generating Comprehensive Report for Project #{project_id}: '{project_name}'")
        r = requests.post(
            f"{BASE}/reports/project/{project_id}/generate",
            headers=headers,
            json={"type": "project_comprehensive", "title": f"E2E Test Report - {label}"}
        )
        if r.status_code in (200, 201):
            data = r.json()
            proj_data = data.get("data", {}).get("project", {})
            milestones = data.get("data", {}).get("milestones", [])
            procurement = data.get("data", {}).get("procurement", [])
            workforce = data.get("data", {}).get("workforce", {})
            print(f"  [OK] Report id={data.get('id')}")
            print(f"       Project: {proj_data.get('project_name')} | Status: {proj_data.get('status')}")
            print(f"       Milestones: {len(milestones)} | Procurement: {len(procurement)}")
            print(f"       Workforce: {workforce.get('total_employees', 0)} employees")
            print(f"       Attendance: {workforce.get('attendance_summary', {})}")
        else:
            print(f"  [FAIL] Report generation -> {r.status_code} {r.text[:200]}")

        # 4. Get all reports
        r = requests.get(f"{BASE}/reports", headers=headers)
        print(f"  [{'OK' if r.status_code==200 else 'FAIL'}] /reports list -> {r.status_code} | count={len(r.json()) if r.status_code == 200 else 'N/A'}")

        results.append({"role": label, "login": "OK"})

    print(f"\n{'='*60}")
    print("  SUMMARY")
    print(f"{'='*60}")
    for r in results:
        print(f"  {r['role']}: Login={r['login']}")

if __name__ == "__main__":
    run_tests()

