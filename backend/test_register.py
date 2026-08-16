"""Quick test of the /auth/register endpoint."""
import requests

BASE = "http://127.0.0.1:8000"

resp = requests.post(f"{BASE}/auth/register", json={
    "full_name": "Test User",
    "email": "testuser_001@buildtrack.dev",
    "password": "Test@1234",
    "phone_number": "9876543210",
    "role": "Site Engineer"
})

print(f"Status: {resp.status_code}")
print(f"Body:   {resp.json()}")
