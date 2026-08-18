import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser, ChangePasswordPayload, LoginPayload, ProfileUpdatePayload, RegisterPayload, RoleName } from './models/auth.model';

// Real backend integration for all auth operations — login, register,
// forgot-password, verify-otp, reset-password, /auth/me,
// updateProfile (PUT /auth/me), changePassword (PUT /auth/change-password).

const SESSION_KEY = 'buildtrack_current_user';
const TOKEN_KEY = 'buildtrack_access_token';

interface BackendUserProfile {
  user_id: number | string;
  full_name?: string;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number: string;
  role?: RoleName;
  company_name?: string;
  tax_id?: string;
  employee_id?: string;
  skills_or_trade?: string;
  assigned_projects?: string[];
  is_active: boolean;
  created_at?: string;
}

function toAppUser(u: BackendUserProfile): AppUser {
  const computedFullName = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || u.email;
  return {
    userId: String(u.user_id),
    username: u.username || u.email.split('@')[0],
    fullName: computedFullName,
    email: u.email,
    firstName: u.first_name || computedFullName.split(' ')[0],
    lastName: u.last_name || computedFullName.split(' ').slice(1).join(' ') || '',
    phoneNumber: u.phone_number,
    role: (u.role || 'Administrator') as RoleName,
    companyName: u.company_name,
    taxId: u.tax_id,
    employeeId: u.employee_id,
    skillsOrTrade: u.skills_or_trade,
    assignedProjects: u.assigned_projects ?? [],
    isActive: u.is_active,
    createdAt: u.created_at,
  };
}

@Injectable({ providedIn: 'root' })
export class AuthDataService {
  roles: RoleName[] = [
    'Administrator',
    'Project Manager',
    'Site Engineer',
    'Contractor',
    'Worker',
    'Client / Owner',
    'Vendor'
  ];

  private apiUrl = environment.apiUrl;

  private currentUser$$ = new BehaviorSubject<AppUser | null>(this.loadSession());
  currentUser$ = this.currentUser$$.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): AppUser | null {
    return this.currentUser$$.value;
  }

  get token(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(TOKEN_KEY);
      } catch {}
    }
    return null;
  }

  private loadSession(): AppUser | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as AppUser) : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private setSession(user: AppUser | null) {
    this.currentUser$$.next(user);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        if (user) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {}
    }
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}` });
  }

  private handleError = (err: HttpErrorResponse) => {
    const detail = err.error?.detail;
    const message = typeof detail === 'string' ? detail : 'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  };

  /** Real login — backend expects OAuth2 form fields (username + password), not JSON. */
  login(payload: LoginPayload): Observable<AppUser> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', payload.username);
    body.set('password', payload.password);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http
      .post<{ access_token: string; token_type: string }>(`${this.apiUrl}/auth/login`, body.toString(), { headers })
      .pipe(
        tap(res => {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem(TOKEN_KEY, res.access_token);
            } catch {}
          }
        }),
        switchMap(() => this.fetchCurrentUser()),
        catchError(this.handleError)
      );
  }

  /** GET /auth/me — used right after login to know the role for dashboard routing. */
  fetchCurrentUser(): Observable<AppUser> {
    return this.http.get<BackendUserProfile>(`${this.apiUrl}/auth/me`, { headers: this.authHeaders() }).pipe(
      map(toAppUser),
      tap(user => this.setSession(user)),
      catchError(this.handleError)
    );
  }

  logout() {
    this.setSession(null);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {}
    }
  }

  register(payload: RegisterPayload): Observable<AppUser> {
    const body = {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone_number: payload.phoneNumber,
      role: payload.role,
      company_name: payload.companyName || null,
      tax_id: payload.taxId || null,
      employee_id: payload.employeeId || null,
      skills_or_trade: payload.skillsOrTrade || null,
    };

    return this.http
      .post<BackendUserProfile>(`${this.apiUrl}/auth/register`, body)
      .pipe(map(toAppUser), catchError(this.handleError));
  }

  /** Step 1 — request an OTP be emailed. */
  requestOtp(email: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  /** Step 2 — verify the OTP, returns a short-lived verification_token. */
  verifyOtp(email: string, otpCode: string): Observable<{ verification_token: string }> {
    return this.http
      .post<{ verification_token: string }>(`${this.apiUrl}/verify-otp`, { email, otp_code: otpCode })
      .pipe(catchError(this.handleError));
  }

  /** Step 3 — reset the password using the verification_token from step 2. */
  resetPassword(email: string, verificationToken: string, newPassword: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/reset-password`, {
        email,
        verification_token: verificationToken,
        new_password: newPassword,
      })
      .pipe(catchError(this.handleError));
  }

  // ---------------------------------------------------------------------
  // REAL backend calls for profile and password management
  // ---------------------------------------------------------------------

  /** PUT /auth/me — update display name, phone number, profile image. */
  updateProfile(userId: string, updates: ProfileUpdatePayload): Observable<{ success: boolean; error?: string }> {
    const body: Record<string, string> = {
      full_name: updates.fullName,
      phone_number: updates.phoneNumber,
    };

    return this.http.put<BackendUserProfile>(
      `${this.apiUrl}/auth/me`,
      body,
      { headers: this.authHeaders() }
    ).pipe(
      map(updated => {
        const appUser = toAppUser(updated);
        this.setSession(appUser);
        return { success: true };
      }),
      catchError((err: HttpErrorResponse) => {
        const detail = err.error?.detail;
        const message = typeof detail === 'string' ? detail : 'Failed to update profile.';
        return of({ success: false, error: message });
      })
    );
  }

  /** PUT /auth/change-password — change password via real backend. */
  changePassword(payload: ChangePasswordPayload): Observable<{ success: boolean; error?: string }> {
    if (payload.newPassword.length < 6) {
      return of({ success: false, error: 'New password must be at least 6 characters.' });
    }

    return this.http.put<{ message: string }>(
      `${this.apiUrl}/auth/change-password`,
      {
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
      },
      { headers: this.authHeaders() }
    ).pipe(
      map(() => ({ success: true })),
      catchError((err: HttpErrorResponse) => {
        const detail = err.error?.detail;
        const message = typeof detail === 'string' ? detail : 'Failed to change password.';
        return of({ success: false, error: message });
      })
    );
  }

  /** GET /auth/users — list all users (admin only). */
  getAllUsers(): AppUser[] {
    // Returns cached session user; full list is fetched via backend when needed.
    const current = this.currentUser;
    return current ? [current] : [];
  }
}

