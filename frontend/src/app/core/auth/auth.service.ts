import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, catchError, Observable, of, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  LoginRequest,
  LoginResponse,
  CurrentUser,
  CompanyRegistrationRequest,
  EmployeeRegistrationRequest,
  ChangePasswordRequest,
  ApiResponse,
  CompanyRegistrationData,
  EmployeeRegistrationData,
  LookupResponse,
  UpdateProfileRequest,
  RequestOtpRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordRequest,
} from './auth.models';

import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  ensureCurrentUser(): Observable<CurrentUser | null> {
    if (this.currentUser) {
      return of(this.currentUser);
    }

    if (!this.tokenService.isLoggedIn()) {
      return of(null);
    }

    return this.getCurrentUser().pipe(
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  login(payload: LoginRequest): Observable<CurrentUser> {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, payload).pipe(
      tap((response) => {
        this.tokenService.setToken(response.data.token.access_token);
      }),

      tap((response) => {
        this.currentUserSubject.next(response.data.user);
      }),

      switchMap(() => this.getCurrentUser()),
    );
  }

  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.api}/users/me`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      }),
    );
  }

  registerCompany(payload: CompanyRegistrationRequest) {
    return this.http.post<ApiResponse<CompanyRegistrationData>>(
      `${this.api}/auth/company/register`,
      payload,
    );
  }

  registerEmployee(payload: EmployeeRegistrationRequest) {
    return this.http.post<ApiResponse<EmployeeRegistrationData>>(
      `${this.api}/auth/employee/register`,
      payload,
    );
  }

  loadUser() {
    return this.ensureCurrentUser();
  }

  requestOtp(payload: RequestOtpRequest) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.api}/auth/request-otp`,
      payload,
    );
  }

  verifyOtp(payload: VerifyOtpRequest) {
    return this.http.post<VerifyOtpResponse>(`${this.api}/auth/verify-otp`, payload);
  }

  resetPassword(payload: ResetPasswordRequest) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.api}/auth/reset-password`,
      payload,
    );
  }

  getLookups(): Observable<LookupResponse> {
    return this.http.get<LookupResponse>(`${this.api}/lookups`);
  }

  listUsers(): Observable<CurrentUser[]> {
    return this.http.get<CurrentUser[]>(`${this.api}/users`);
  }

  updateProfile(payload: UpdateProfileRequest): Observable<CurrentUser> {
    return this.http.put<CurrentUser>(`${this.api}/users/me`, payload).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      }),
    );
  }

  changePassword(payload: ChangePasswordRequest) {
    return this.http.put<{ message: string }>(`${this.api}/users/change-password`, payload);
  }

  logout(redirect = true): void {
    this.tokenService.clear();
    this.currentUserSubject.next(null);

    if (redirect) {
      window.location.href = '/login';
    }
  }

  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }
}
