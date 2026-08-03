import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { LookupItem, EMPLOYEE_REGISTRATION_ROLES } from '../../core/auth/auth.models';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;

  if (!password || !confirm) {
    return null;
  }

  return password === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  companyForm!: FormGroup;
  employeeForm!: FormGroup;

  mode: 'company' | 'employee' = 'company';

  loading = false;
  success = false;
  error = '';

  roles: LookupItem[] = [];

  ngOnInit(): void {
    this.mode =
      this.route.snapshot.data['registrationMode'] === 'employee' ? 'employee' : 'company';

    this.buildForms();

    this.auth.getLookups().subscribe({
      next: (lookup) => {
        this.roles = lookup.roles.filter((role) =>
          EMPLOYEE_REGISTRATION_ROLES.includes(
            role.name as (typeof EMPLOYEE_REGISTRATION_ROLES)[number],
          ),
        );
      },
      error: () => {
        this.error = 'Unable to load registration data.';
      },
    });
  }

  private buildForms(): void {
    this.companyForm = this.fb.group(
      {
        company_name: ['', Validators.required],
        company_email: ['', [Validators.required, Validators.email]],
        company_phone: ['', Validators.required],
        address: ['', Validators.required],

        admin_name: ['', Validators.required],
        admin_email: ['', [Validators.required, Validators.email]],
        admin_phone: ['', Validators.required],

        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: passwordsMatch,
      },
    );

    this.employeeForm = this.fb.group(
      {
        full_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone_number: ['', Validators.required],
        company_code: ['', Validators.required],
        role_id: [null, Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: passwordsMatch,
      },
    );
  }

  submit(): void {
    this.error = '';

    if (this.mode === 'company') {
      this.registerCompany();
    } else {
      this.registerEmployee();
    }
  }

  private registerCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();

      if (this.companyForm.errors?.['mismatch']) {
        this.error = 'Passwords do not match.';
      }

      return;
    }

    this.loading = true;

    const value = this.companyForm.getRawValue();

    this.auth
      .registerCompany({
        company_name: value.company_name,
        company_email: value.company_email,
        company_phone: value.company_phone,
        address: value.address,

        admin_name: value.admin_name,
        admin_email: value.admin_email,
        admin_phone: value.admin_phone,

        password: value.password,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.success = true;

          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 1200);
        },
        error: (err) => {
          this.error = err?.error?.detail ?? err?.error?.message ?? 'Registration failed.';
        },
      });
  }

  private registerEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();

      if (this.employeeForm.errors?.['mismatch']) {
        this.error = 'Passwords do not match.';
      }

      return;
    }

    this.loading = true;

    const value = this.employeeForm.getRawValue();

    this.auth
      .registerEmployee({
        full_name: value.full_name,
        email: value.email,
        phone_number: value.phone_number,
        company_code: value.company_code,
        role_id: Number(value.role_id),
        password: value.password,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.success = true;

          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 1200);
        },
        error: (err) => {
          this.error = err?.error?.detail ?? err?.error?.message ?? 'Registration failed.';
        },
      });
  }
}
