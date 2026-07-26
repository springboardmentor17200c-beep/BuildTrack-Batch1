import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../auth/auth-data.service';
import { RoleName } from '../auth/models/auth.model';
import { TranslatePipe } from '../shared/translate.pipe';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
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
        username: ['', [Validators.required, Validators.minLength(3)]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', Validators.required],
        role: ['', Validators.required],
        companyName: [''],
        taxId: [''],
        employeeId: [''],
        skillsOrTrade: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatch }
    );
  }

  get selectedRole(): string {
    return this.form.get('role')?.value || '';
  }

  get showCompanyFields(): boolean {
    return this.selectedRole === 'Contractor' || this.selectedRole === 'Client / Owner';
  }

  get showEmployeeFields(): boolean {
    return this.selectedRole === 'Worker' || this.selectedRole === 'Site Engineer';
  }

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.errors?.['mismatch']) this.error = 'Passwords do not match.';
      return;
    }

    this.submitting = true;
    const v = this.form.value;
    this.auth
      .register({
        username: v.username,
        email: v.email,
        password: v.password,
        firstName: v.firstName,
        lastName: v.lastName,
        phoneNumber: v.phoneNumber,
        role: v.role,
        companyName: v.companyName,
        taxId: v.taxId,
        employeeId: v.employeeId,
        skillsOrTrade: v.skillsOrTrade,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.success = true;
          setTimeout(() => this.router.navigate(['/login']), 1200);
        },
        error: err => {
          this.submitting = false;
          this.error = err.message || 'Registration failed. Please try again.';
        },
      });
  }
}