import requests

r = requests.post("http://127.0.0.1:8000/auth/login", data={
    "username": "testuser_001@buildtrack.dev",
    "password": "Test@1234"
})
print(f"Status: {r.status_code}")
body = r.json()
if "access_token" in body:
    print(f"Login OK - token_type: {body['token_type']}, token length: {len(body['access_token'])}")
else:
    print(f"Login FAILED: {body}")
