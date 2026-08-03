import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CurrentUser } from '../../core/auth/auth.models';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  user: CurrentUser | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;

  profileError = '';
  profileSuccess = false;
  passwordError = '';
  passwordSuccess = false;

  activeSection: 'details' | 'security' = 'details';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private location: Location,
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      profileImage: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatch },
    );
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          fullName: user.full_name,
          phoneNumber: user.phone_number,
          profileImage: user.profile_image || '',
        });
      }
    });
  }

  saveProfile() {
    this.profileError = '';
    this.profileSuccess = false;
    if (this.profileForm.invalid || !this.user) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { fullName, phoneNumber, profileImage } = this.profileForm.value;
    this.auth
      .updateProfile({
        full_name: fullName || '',
        phone_number: phoneNumber || '',
        profile_image: profileImage || null,
      })
      .subscribe({
        next: (user) => {
          this.user = user;
          this.profileSuccess = true;
        },
        error: (err: HttpErrorResponse) => {
          this.profileError = this.errorMessage(err, 'Could not update profile.');
        },
      });
  }

  changePassword() {
    this.passwordError = '';
    this.passwordSuccess = false;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      if (this.passwordForm.errors?.['mismatch']) this.passwordError = 'Passwords do not match.';
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.auth
      .changePassword({
        current_password: currentPassword || '',
        new_password: newPassword || '',
      })
      .subscribe({
        next: () => {
          this.passwordSuccess = true;
          this.passwordForm.reset();
        },
        error: (err: HttpErrorResponse) => {
          this.passwordError = this.errorMessage(err, 'Could not change password.');
        },
      });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goBack(): void {
    this.location.back();
  }

  private errorMessage(err: HttpErrorResponse, fallback: string): string {
    const detail = err.error?.detail;
    return typeof detail === 'string' ? detail : fallback;
  }
}
