import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  showPassword = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (user) => {
          const roleRoutes: Record<string, string> = {
            Administrator: '/dashboard/admin',
            'Project Manager': '/dashboard/pm',
            'Site Engineer': '/dashboard/site-engineer',
            Contractor: '/dashboard/contractor',
            Client: '/dashboard/client',
            'Client / Owner': '/dashboard/client',
          };

          this.router.navigateByUrl(roleRoutes[user.role_name] ?? '/dashboard');
        },
        error: (err) => {
          this.error.set(err?.error?.detail ?? err?.error?.message ?? 'Invalid email or password');
        },
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
