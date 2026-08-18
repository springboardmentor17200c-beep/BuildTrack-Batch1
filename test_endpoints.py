import requests

def test():
    # Login as admin
    login_res = requests.post('http://127.0.0.1:8000/auth/login', data={'username':'admin','password':'password'})
    token = login_res.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}

    # Fetch employees to get a valid employee ID
    emps = requests.get('http://127.0.0.1:8000/workforce/employees', headers=headers).json()
    if not emps:
        print("No employees found.")
        return
    
    emp = emps[0]
    print(f"Using employee: {emp['employee_id']} - {emp['full_name']}")

    # Test Shift Creation
    shift_payload = {
        "employee_id": emp['employee_id'],
        "project_name": "Test Project",
        "shift_type": "Morning",
        "shift_date": "2026-08-19",
        "start_time": "08:00 AM",
        "end_time": "04:00 PM"
    }
    
    print("Testing POST /workforce/shifts...")
    res = requests.post('http://127.0.0.1:8000/workforce/shifts', json=shift_payload, headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")

    # Test Attendance Creation
    att_payload = {
        "employee_id": emp['employee_id'],
        "project_name": "Test Project",
        "attendance_date": "2026-08-19",
        "attendance_status": "Present",
        "check_in_time": "2026-08-19T08:00:00"
    }

    print("\nTesting POST /workforce/attendance...")
    res2 = requests.post('http://127.0.0.1:8000/workforce/attendance', json=att_payload, headers=headers)
    print(f"Status: {res2.status_code}")
    print(f"Response: {res2.text}")

if __name__ == '__main__':
    test()
