import requests

users = ['admin', 'admin_test', 'pm_test', 'client_test', 'engineer', 'contractor_test', 'worker_test']

token = None
for u in users:
    resp = requests.post('http://127.0.0.1:8000/auth/login', data={'username': u, 'password': 'password123'})
    if resp.status_code == 200:
        token = resp.json().get('access_token')
        break

if not token:
    for u in users:
        resp = requests.post('http://127.0.0.1:8000/auth/login', data={'username': u, 'password': 'password'})
        if resp.status_code == 200:
            token = resp.json().get('access_token')
            break

if token:
    headers = {'Authorization': f'Bearer {token}'}
    resp = requests.get('http://127.0.0.1:8000/project-milestones', headers=headers)
    print("API Response:", resp.json())
else:
    print("Could not get token!")
