import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { } from '../../shared/sidebar/app-sidebar.component';
import { ProcurementDataService } from '../procurement-data.service';
import { Vendor } from '../models/procurement.model';
import { AuthDataService } from '../../auth/auth-data.service';

@Component({
  selector: 'app-vendor-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vendor-management.component.html',
  styleUrls: ['./vendor-management.component.css'],
})
export class VendorManagementComponent implements OnInit {
  vendors: Vendor[] = [];
  showForm = false;
  loading = true;
  loadError = '';
  formError = '';
  form: FormGroup;

  get canManage(): boolean {
    const role = this.auth.currentUser?.role;
    return role === 'Administrator';
  }
  get canDelete(): boolean {
    return this.auth.currentUser?.role === 'Administrator';
  }

  constructor(private data: ProcurementDataService, private fb: FormBuilder, private auth: AuthDataService) {
    this.form = this.fb.group({
      vendorName: ['', Validators.required],
      contactPerson: [''],
      email: ['', Validators.email],
      phone: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors() {
    this.loading = true;
    this.data.getVendors().subscribe({
      next: vendors => {
        this.vendors = vendors;
        this.loading = false;
      },
      error: err => {
        this.loadError = err.message || 'Could not load vendors.';
        this.loading = false;
      },
    });
  }

  toggleStatus(vendor: Vendor) {
    this.data.updateVendor(vendor.id, { isActive: !vendor.isActive }).subscribe({
      next: () => this.loadVendors(),
      error: err => (this.loadError = err.message || 'Could not update vendor.'),
    });
  }

  deleteVendor(vendor: Vendor) {
    this.data.deleteVendor(vendor.id).subscribe({
      next: () => this.loadVendors(),
      error: err => (this.loadError = err.message || 'Could not delete vendor.'),
    });
  }

  submit() {
    this.formError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    this.data
      .createVendor({
        vendorName: v.vendorName,
        contactPerson: v.contactPerson || '',
        email: v.email || '',
        phone: v.phone || '',
        address: v.address || '',
        materials: [],
        rating: 0,
        isActive: true
      })
      .subscribe({
        next: () => {
          this.form.reset();
          this.showForm = false;
          this.loadVendors();
        },
        error: err => (this.formError = err.message || 'Could not create vendor.'),
      });
  }
}