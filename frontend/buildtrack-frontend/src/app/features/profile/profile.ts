import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { } from '../shared/sidebar/app-sidebar.component';
import { AuthDataService } from '../auth/auth-data.service';
import { AppUser } from '../auth/models/auth.model';

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
  user: AppUser | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;

  profileError = '';
  profileSuccess = false;
  profileSubmitting = false;

  passwordError = '';
  passwordSuccess = false;
  passwordSubmitting = false;

  activeSection: 'details' | 'security' = 'details';

  constructor(private fb: FormBuilder, private auth: AuthDataService, private router: Router, private location: Location) {
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
      { validators: passwordsMatch }
    );
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          profileImage: (user as any).profileImage || '',
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

    this.profileSubmitting = true;
    this.auth.updateProfile(this.user.userId, this.profileForm.value).subscribe({
      next: result => {
        this.profileSubmitting = false;
        if (result.success) {
          this.profileSuccess = true;
        } else {
          this.profileError = result.error || 'Could not update profile.';
        }
      },
      error: () => {
        this.profileSubmitting = false;
        this.profileError = 'Could not update profile.';
      }
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
    this.passwordSubmitting = true;
    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: result => {
        this.passwordSubmitting = false;
        if (result.success) {
          this.passwordSuccess = true;
          this.passwordForm.reset();
        } else {
          this.passwordError = result.error || 'Could not change password.';
        }
      },
      error: () => {
        this.passwordSubmitting = false;
        this.passwordError = 'Could not change password.';
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.location.back();
  }
}
