import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../auth/auth-data.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword {
  step: 1 | 2 = 1;
  error = '';
  success = false;
  submitting = false;

  emailForm: FormGroup;
  resetForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthDataService, private router: Router) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group(
      {
        otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatch }
    );
  }

  get email(): string {
    return this.emailForm.value.email;
  }

  sendOtp() {
    this.error = '';
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const result = this.auth.requestOtp(this.email);
    this.submitting = false;

    if (!result.success) {
      this.error = result.error || 'Could not send OTP. Please try again.';
      return;
    }

    this.step = 2;
  }

  confirmReset() {
    this.error = '';
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      if (this.resetForm.errors?.['mismatch']) this.error = 'Passwords do not match.';
      return;
    }

    const { otp, newPassword } = this.resetForm.value;
    this.submitting = true;
    const result = this.auth.confirmReset(this.email, otp, newPassword);
    this.submitting = false;

    if (!result.success) {
      this.error = result.error || 'Could not reset password. Please try again.';
      return;
    }

    this.success = true;
    setTimeout(() => this.router.navigate(['/login']), 1200);
  }

  backToStep1() {
    this.step = 1;
    this.error = '';
  }
}
