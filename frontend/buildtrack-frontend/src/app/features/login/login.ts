import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../auth/auth-data.service';
import { DASHBOARD_ROUTE_BY_ROLE } from '../auth/models/auth.model';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  form: FormGroup;
  error = '';
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthDataService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
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
    this.auth.login(this.form.value).subscribe({
      next: user => {
        this.submitting = false;
        this.cdr.detectChanges();
        const route = DASHBOARD_ROUTE_BY_ROLE[user.role] || '/dashboard';
        this.router.navigate([route]);
      },
      error: err => {
        this.submitting = false;
        this.error = err.message || 'Login failed. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }
}