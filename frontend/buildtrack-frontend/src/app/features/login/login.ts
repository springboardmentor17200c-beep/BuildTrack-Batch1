import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../auth/auth-data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  form: FormGroup;
  error = '';
  submitting = false;

  constructor(private fb: FormBuilder, private auth: AuthDataService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const result = this.auth.login(this.form.value);
    this.submitting = false;

    if (!result.success) {
      this.error = result.error || 'Login failed. Please try again.';
      return;
    }

    this.router.navigate(['/dashboard']);
  }
}
