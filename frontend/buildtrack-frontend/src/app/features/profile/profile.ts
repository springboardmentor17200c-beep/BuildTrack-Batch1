import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  passwordError = '';
  passwordSuccess = false;

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

    const result = this.auth.updateProfile(this.user.userId, this.profileForm.value);
    if (!result.success) {
      this.profileError = result.error || 'Could not update profile.';
      return;
    }
    this.profileSuccess = true;
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
    const result = this.auth.changePassword({ currentPassword, newPassword });
    if (!result.success) {
      this.passwordError = result.error || 'Could not change password.';
      return;
    }
    this.passwordSuccess = true;
    this.passwordForm.reset();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goBack(): void {
    this.location.back();
  }
}