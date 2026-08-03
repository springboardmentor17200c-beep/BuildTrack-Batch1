import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../shared/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword {
  step: 1 | 2 = 1;
  error = '';
  success = false;
  submitting = false;
  private verificationToken = '';

  emailForm: FormGroup;
  resetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group(
      {
        otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatch },
    );
  }

  get email(): string {
    return this.emailForm.value.email;
  }

  /** Step 1 — request an OTP be emailed. */
  sendOtp() {
    this.error = '';
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.auth.requestOtp({ email: this.email }).subscribe({
      next: () => {
        this.submitting = false;
        this.step = 2;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.submitting = false;
        this.error = err.message || 'Could not send OTP. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  /** Step 2 (UI) — chains verify-otp then reset-password behind one submit. */
  confirmReset() {
    this.error = '';
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      if (this.resetForm.errors?.['mismatch']) this.error = 'Passwords do not match.';
      return;
    }

    const { otp, newPassword } = this.resetForm.value;
    this.submitting = true;

    this.auth.verifyOtp({ email: this.email, otp }).subscribe({
      next: (verifyRes) => {
        this.verificationToken = verifyRes.verification_token;
        this.auth
          .resetPassword({
            email: this.email,
            verification_token: this.verificationToken,
            new_password: newPassword,
          })
          .subscribe({
            next: () => {
              this.submitting = false;
              this.success = true;
              this.cdr.detectChanges();
              setTimeout(() => this.router.navigate(['/login']), 1200);
            },
            error: (err: any) => {
              this.submitting = false;
              this.error = err.message || 'Could not reset password. Please try again.';
              this.cdr.detectChanges();
            },
          });
      },
      error: (err: any) => {
        this.submitting = false;
        this.error = err.message || 'Invalid OTP. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  backToStep1() {
    this.step = 1;
    this.error = '';
    this.cdr.detectChanges();
  }
}
