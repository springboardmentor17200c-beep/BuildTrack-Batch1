import os
import re

auth_service_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/auth/auth-data.service.ts'

with open(auth_service_path, 'r', encoding='utf-8') as f:
    auth_content = f.read()

# Replace the old synchronous getAllUsers with the new Observable one
old_method_pattern = r"/\*\* GET /auth/users — list all users \(admin only\)\. \*/\s*getAllUsers\(\): AppUser\[\] \{\s*// Returns cached session user; full list is fetched via backend when needed\.\s*const current = this\.currentUser;\s*return current \? \[current\] : \[\];\s*\}"

new_method = """/** GET /auth/users — list all users for dropdowns. */
  getAllUsers(): Observable<AppUser[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any[]>(`${this.apiUrl}/auth/users`, { headers }).pipe(
      map(users => users.map(toAppUser))
    );
  }"""

# If regex finds it, replace it
auth_content = re.sub(old_method_pattern, new_method, auth_content, flags=re.MULTILINE | re.DOTALL)

with open(auth_service_path, 'w', encoding='utf-8') as f:
    f.write(auth_content)
