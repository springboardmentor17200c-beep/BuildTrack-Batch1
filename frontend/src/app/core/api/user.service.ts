import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { API_ENDPOINTS } from './endpoints';

import { CurrentUser } from '../auth/auth.models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);

  getUsers(): Observable<CurrentUser[]> {
    return this.api.get<CurrentUser[]>(API_ENDPOINTS.USERS.BASE);
  }

  getCurrentUser(): Observable<CurrentUser> {
    return this.api.get<CurrentUser>(API_ENDPOINTS.USERS.ME);
  }

  updateProfile(payload: any): Observable<CurrentUser> {
    return this.api.put<CurrentUser>(API_ENDPOINTS.USERS.ME, payload);
  }

  changePassword(payload: any): Observable<any> {
    return this.api.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, payload);
  }
}
