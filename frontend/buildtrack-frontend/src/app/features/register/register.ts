import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../auth/auth-data.service';
import { RoleName } from '../auth/models/auth.model';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  form: FormGroup;
  error = '';
  success = false;
  submitting = false;
  roles: RoleName[];

  constructor(private fb: FormBuilder, private auth: AuthDataService, private router: Router) {
    this.roles = this.auth.roles;
    this.form = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', Validators.required],
        role: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatch }
    );
  }

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.errors?.['mismatch']) this.error = 'Passwords do not match.';
      return;
    }

    this.submitting = true;
    const { fullName, email, phoneNumber, role, password } = this.form.value;
    const result = this.auth.register({ fullName, email, phoneNumber, role, password });
    this.submitting = false;

    if (!result.success) {
      this.error = result.error || 'Registration failed. Please try again.';
      return;
    }

    this.success = true;
    setTimeout(() => this.router.navigate(['/login']), 1200);
  }
}
