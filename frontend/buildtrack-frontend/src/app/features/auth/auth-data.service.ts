import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  AppUser,
  ChangePasswordPayload,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  RoleName,
} from './models/auth.model';

// NOTE: mock/in-memory data for now. Your teammate's existing backend
// already sends a real OTP to email (see the "send otp to mail" commit) —
// once that's wired up, replace the methods below with HttpClient calls:
//   POST /api/auth/login          -> JWT
//   POST /api/auth/register       -> creates a `users` row
//   POST /api/auth/request-otp    -> sends OTP to email
//   POST /api/auth/reset-password -> verifies OTP, updates password_hash
//   PATCH /api/users/:id          -> profile update
//   POST /api/auth/change-password
// The mock OTP below is always '123456' so the flow can be demoed without
// a live email service.
//
// Session state (currentUser$) is persisted to localStorage so a page
// refresh doesn't log the user out — swap for real JWT storage/refresh
// logic once the backend is connected.

const MOCK_OTP = '123456';
const SESSION_KEY = 'buildtrack_current_user';

@Injectable({ providedIn: 'root' })
export class AuthDataService {
  roles: RoleName[] = [
    'Administrator',
    'Project Manager',
    'Site Engineer',
    'Contractor',
    'Worker',
    'Client',
  ];

  private users: AppUser[] = [
    { userId: 'U-1', fullName: 'Arjun Rao', email: 'arjun.rao@buildtrack.com', phoneNumber: '+91 98450 00011', role: 'Administrator', isActive: true },
    { userId: 'U-2', fullName: 'Priya Menon', email: 'priya.menon@buildtrack.com', phoneNumber: '+91 98450 00022', role: 'Project Manager', isActive: true },
    { userId: 'U-3', fullName: 'Karthik Iyer', email: 'karthik.iyer@buildtrack.com', phoneNumber: '+91 98450 00033', role: 'Site Engineer', isActive: true },
    { userId: 'U-4', fullName: 'Suresh Electricals', email: 'suresh.contractor@buildtrack.com', phoneNumber: '+91 98450 00044', role: 'Contractor', isActive: true },
    { userId: 'U-5', fullName: 'Rohan Desai', email: 'rohan.client@buildtrack.com', phoneNumber: '+91 98450 00055', role: 'Client', isActive: true },
    { userId: 'U-6', fullName: 'Mohan Das', email: 'mohan.worker@buildtrack.com', phoneNumber: '+91 98450 00066', role: 'Worker', isActive: true },
  ];

  private currentUser$$ = new BehaviorSubject<AppUser | null>(this.loadSession());
  currentUser$ = this.currentUser$$.asObservable();

  get currentUser(): AppUser | null {
    return this.currentUser$$.value;
  }

  /** Read-only copy of all users — used by the Admin Dashboard's User Management panel. */
  getAllUsers(): AppUser[] {
    return [...this.users];
  }

  private loadSession(): AppUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  }

  private setCurrentUser(user: AppUser | null) {
    this.currentUser$$.next(user);
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  /** Mock login check — any of the seeded users above, with password "password123". */
  login(payload: LoginPayload): { success: boolean; error?: string; user?: AppUser } {
    const user = this.users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
    if (!user) return { success: false, error: 'No account found with this email.' };
    if (!user.isActive) return { success: false, error: 'This account has been deactivated.' };
    if (payload.password !== 'password123') return { success: false, error: 'Incorrect password.' };

    this.setCurrentUser(user);
    return { success: true, user };
  }

  logout() {
    this.setCurrentUser(null);
  }

  register(payload: RegisterPayload): { success: boolean; error?: string } {
    const exists = this.users.some(u => u.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) return { success: false, error: 'An account with this email already exists.' };

    this.users.push({
      userId: 'U-' + Math.floor(100 + Math.random() * 900),
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
      isActive: true,
    });
    return { success: true };
  }

  /** Step 1 of password reset — pretend an OTP was emailed. */
  requestOtp(email: string): { success: boolean; error?: string } {
    const exists = this.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) return { success: false, error: 'No account found with this email.' };
    return { success: true };
  }

  /** Step 2 — verify the OTP and "update" the password. */
  confirmReset(email: string, otp: string, newPassword: string): { success: boolean; error?: string } {
    if (otp !== MOCK_OTP) return { success: false, error: 'Invalid OTP. Please try again.' };
    if (newPassword.length < 8) return { success: false, error: 'Password must be at least 8 characters.' };
    return { success: true };
  }

  updateProfile(userId: string, updates: ProfileUpdatePayload): { success: boolean; error?: string } {
    const index = this.users.findIndex(u => u.userId === userId);
    if (index === -1) return { success: false, error: 'User not found.' };

    this.users[index] = { ...this.users[index], ...updates };
    if (this.currentUser?.userId === userId) {
      this.setCurrentUser(this.users[index]);
    }
    return { success: true };
  }

  changePassword(payload: ChangePasswordPayload): { success: boolean; error?: string } {
    if (payload.currentPassword !== 'password123') {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (payload.newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters.' };
    }
    return { success: true };
  }
}