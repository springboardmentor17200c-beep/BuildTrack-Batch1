import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser, ChangePasswordPayload, LoginPayload, ProfileUpdatePayload, RegisterPayload, RoleName } from './models/auth.model';

// Real backend integration for login/register/forgot-password/verify-otp/
// reset-password/users-me — all hit FastAPI at environment.apiUrl.
//
// getAllUsers() / updateProfile() / changePassword() stay as local/mock
// logic below because the backend doesn't have those endpoints yet
// (no GET /users list, no PATCH /users/:id, no /change-password route).
// Swap these for real HttpClient calls once your teammate adds them.

const SESSION_KEY = 'buildtrack_current_user';
const TOKEN_KEY = 'buildtrack_access_token';

interface BackendUserProfile {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: RoleName;
  company_name?: string;
  tax_id?: string;
  employee_id?: string;
  skills_or_trade?: string;
  assigned_projects: string[];
  is_active: boolean;
  created_at?: string;
}

function toAppUser(u: BackendUserProfile): AppUser {
  return {
    userId: u.user_id,
    username: u.username,
    fullName: `${u.first_name} ${u.last_name}`.trim(),
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    phoneNumber: u.phone_number,
    role: u.role,
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
      .post<{ access_token: string; token_type: string }>(`${this.apiUrl}/login`, body.toString(), { headers })
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

  /** GET /users/me — used right after login to know the role for dashboard routing. */
  fetchCurrentUser(): Observable<AppUser> {
    return this.http.get<BackendUserProfile>(`${this.apiUrl}/users/me`, { headers: this.authHeaders() }).pipe(
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
      .post<BackendUserProfile>(`${this.apiUrl}/register`, body)
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
  // MOCK / LOCAL ONLY — no matching backend endpoint exists yet.
  // Kept so Admin Dashboard, Profile page, etc. keep compiling and working
  // with placeholder behavior. Replace with real HttpClient calls once
  // your teammate adds: GET /users, PATCH /users/:id, POST /change-password
  // ---------------------------------------------------------------------

  private mockUsers: AppUser[] = [];

  /** Placeholder — backend has no GET /users list endpoint yet. */
  getAllUsers(): AppUser[] {
    const current = this.currentUser;
    return current ? [current, ...this.mockUsers] : [...this.mockUsers];
  }

  /** Placeholder — backend has no PATCH /users/:id endpoint yet. */
  updateProfile(userId: string, updates: ProfileUpdatePayload): { success: boolean; error?: string } {
    if (!this.currentUser || this.currentUser.userId !== userId) {
      return { success: false, error: 'User not found.' };
    }
    const [firstName, ...rest] = updates.fullName.trim().split(' ');
    const updated: AppUser = {
      ...this.currentUser,
      fullName: updates.fullName,
      firstName: firstName || this.currentUser.firstName,
      lastName: rest.join(' ') || this.currentUser.lastName,
      phoneNumber: updates.phoneNumber,
    };
    this.setSession(updated);
    return { success: true };
  }

  /** Placeholder — backend has no /change-password endpoint yet. */
  changePassword(payload: ChangePasswordPayload): { success: boolean; error?: string } {
    if (payload.newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }
    // No real verification possible without a backend endpoint — optimistic success.
    return { success: true };
  }
}