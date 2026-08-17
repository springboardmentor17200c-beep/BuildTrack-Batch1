import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../auth/auth-data.service';
import { RoleName } from '../auth/models/auth.model';



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
        name: ['', Validators.required],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        role: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]]
      }
    );
  }

  get selectedRole(): string {
    return this.form.get('role')?.value || '';
  }

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please fill out all required fields correctly.';
      alert('Please fill out all required fields correctly.');
      return;
    }

    this.submitting = true;
    const v = this.form.value;
    this.auth
      .register({
        username: v.username,
        email: v.email,
        password: v.password,
        firstName: v.name,
        lastName: '', // simplified frontend only provides full name
        phoneNumber: v.phoneNumber,
        role: v.role,
        companyName: '',
        taxId: '',
        employeeId: '',
        skillsOrTrade: '',
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