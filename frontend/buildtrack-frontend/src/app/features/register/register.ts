import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../auth/auth-data.service';
import { RoleName } from '../auth/models/auth.model';
import { TranslatePipe } from '../shared/translate.pipe';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password !== confirmPassword
    ? { mismatch: true }
    : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe
  ],
  templateUrl: './register.html',
})
export class Register {

  form: FormGroup;

  error = '';
  success = false;
  submitting = false;

  roles: RoleName[];

  constructor(
    private fb: FormBuilder,
    private auth: AuthDataService,
    private router: Router
  ) {

    this.roles = this.auth.roles;

    this.form = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3)
          ]
        ],

        firstName: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[a-zA-Z ]+$/)
          ]
        ],

        lastName: [
          '',
          [
            
            Validators.pattern(/^[a-zA-Z ]+$/)
          ]
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        phoneNumber: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[+]?[0-9 ]{10,16}$/)
          ]
        ],

        role: [
          '',
          Validators.required
        ],

        companyName: [''],
        taxId: [''],

        employeeId: [''],
        skillsOrTrade: [''],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6)
          ]
        ],

        confirmPassword: [
          '',
          Validators.required
        ],
      },
      {
        validators: passwordsMatch
      }
    );

    this.form.get('role')?.valueChanges.subscribe(role => {
      this.updateRoleValidators(role);
    });
  }

  get selectedRole(): string {
    return this.form.get('role')?.value || '';
  }

  get showCompanyFields(): boolean {
    return (
      this.selectedRole === 'Contractor' ||
      this.selectedRole === 'Client / Owner'
    );
  }

  get showEmployeeFields(): boolean {
    return (
      this.selectedRole === 'Worker' ||
      this.selectedRole === 'Site Engineer'
    );
  }

  private updateRoleValidators(role: string): void {

    const companyName = this.form.get('companyName');
    const taxId = this.form.get('taxId');

    const employeeId = this.form.get('employeeId');
    const skillsOrTrade = this.form.get('skillsOrTrade');

    // Remove previous validators
    companyName?.clearValidators();
    taxId?.clearValidators();
    employeeId?.clearValidators();
    skillsOrTrade?.clearValidators();

    // Contractor / Client
    if (
      role === 'Contractor' ||
      role === 'Client / Owner'
    ) {

      companyName?.setValidators([
        Validators.required,
        Validators.minLength(2)
      ]);

      taxId?.setValidators([
        Validators.required,
        Validators.minLength(3)
      ]);

      // Clear worker-specific values
      employeeId?.reset('');
      skillsOrTrade?.reset('');
    }

    // Worker / Site Engineer
    if (
      role === 'Worker' ||
      role === 'Site Engineer'
    ) {

      employeeId?.setValidators([
        Validators.required,
        Validators.minLength(2)
      ]);

      skillsOrTrade?.setValidators([
        Validators.required,
        Validators.minLength(2)
      ]);

      // Clear company-specific values
      companyName?.reset('');
      taxId?.reset('');
    }

    // No role
    if (!role) {
      companyName?.reset('');
      taxId?.reset('');
      employeeId?.reset('');
      skillsOrTrade?.reset('');
    }

    companyName?.updateValueAndValidity();
    taxId?.updateValueAndValidity();
    employeeId?.updateValueAndValidity();
    skillsOrTrade?.updateValueAndValidity();
  }

  submit(): void {

    this.error = '';

    // Prevent duplicate submissions
    if (this.submitting) {
      return;
    }

    // Validate form
    if (this.form.invalid) {

      this.form.markAllAsTouched();

      if (this.form.errors?.['mismatch']) {
        this.error = 'Passwords do not match.';
      } else {
        this.error =
          'Please fill in all mandatory fields correctly.';
      }

      return;
    }

    this.submitting = true;

    const v = this.form.value;

    this.auth.register({
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
        this.error = '';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },

      error: err => {

        this.submitting = false;

        this.error =
          err?.error?.message ||
          err?.message ||
          'Registration failed. Please try again.';
      }
    });
  }

  isInvalid(controlName: string): boolean {

    const control = this.form.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  getErrorMessage(controlName: string): string {

    const control = this.form.get(controlName);

    if (!control || !control.errors) {
      return '';
    }

    // Required
    if (control.errors['required']) {

      switch (controlName) {

        case 'username':
          return 'Username is required.';

        case 'firstName':
          return 'First name is required.';

        case 'lastName':
          return 'Last name is required.';

        case 'email':
          return 'Email address is required.';

        case 'phoneNumber':
          return 'Phone number is required.';

        case 'role':
          return 'Please select a role.';

        case 'companyName':
          return 'Company name is required.';

        case 'taxId':
          return 'Tax ID is required.';

        case 'employeeId':
          return 'Employee ID is required.';

        case 'skillsOrTrade':
          return 'Skills or trade is required.';

        case 'password':
          return 'Password is required.';

        case 'confirmPassword':
          return 'Please confirm your password.';
      }
    }

    // Minimum length
    if (control.errors['minlength']) {

      const requiredLength =
        control.errors['minlength'].requiredLength;

      switch (controlName) {

        case 'username':
          return `Username must contain at least ${requiredLength} characters.`;

        case 'password':
          return `Password must contain at least ${requiredLength} characters.`;

        case 'companyName':
          return `Company name must contain at least ${requiredLength} characters.`;

        case 'taxId':
          return `Tax ID must contain at least ${requiredLength} characters.`;

        case 'employeeId':
          return `Employee ID must contain at least ${requiredLength} characters.`;

        case 'skillsOrTrade':
          return `Skills or trade must contain at least ${requiredLength} characters.`;

        default:
          return `Please enter at least ${requiredLength} characters.`;
      }
    }

    // Email
    if (control.errors['email']) {
      return 'Please enter a valid email address.';
    }

    // Pattern
    if (control.errors['pattern']) {

      if (
        controlName === 'firstName' ||
        controlName === 'lastName'
      ) {
        return 'Only letters and spaces are allowed.';
      }

      if (controlName === 'phoneNumber') {
        return 'Please enter a valid phone number.';
      }
    }

    return 'Please enter a valid value.';
  }
}