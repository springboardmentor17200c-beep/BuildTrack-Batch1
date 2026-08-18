import os
import re

auth_service_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/auth/auth-data.service.ts'

with open(auth_service_path, 'r', encoding='utf-8') as f:
    auth_content = f.read()

if "getAllUsers(" not in auth_content:
    get_users_fn = """
  // Get all users for dropdowns
  getAllUsers(): Observable<AppUser[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any[]>(`${environment.apiUrl}/auth/users`, { headers }).pipe(
      map(users => users.map(u => this.mapBackendUserToAppUser(u)))
    );
  }
"""
    auth_content = auth_content.replace('changePassword(payload:', get_users_fn + '\n  changePassword(payload:')
    with open(auth_service_path, 'w', encoding='utf-8') as f:
        f.write(auth_content)
