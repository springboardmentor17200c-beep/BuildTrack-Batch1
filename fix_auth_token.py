import os

auth_service_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/auth/auth-data.service.ts'

with open(auth_service_path, 'r', encoding='utf-8') as f:
    auth_content = f.read()

# Replace getToken with authHeaders
auth_content = auth_content.replace(
    "const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);\n    return this.http.get<any[]>(`${this.apiUrl}/auth/users`, { headers })",
    "return this.http.get<any[]>(`${this.apiUrl}/auth/users`, { headers: this.authHeaders() })"
)

with open(auth_service_path, 'w', encoding='utf-8') as f:
    f.write(auth_content)
