import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AppSidebarComponent } from '../../shared/sidebar/app-sidebar.component';
import { ProcurementDataService } from '../procurement-data.service';
import { AuthDataService } from '../../auth/auth-data.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vendor, PurchaseOrder, Invoice, MaterialDelivery } from '../models/procurement.model';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AppSidebarComponent],
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.css']
})
export class VendorDashboardComponent implements OnInit {
  vendor: Vendor | null = null;
  purchaseOrders: PurchaseOrder[] = [];
  invoices: Invoice[] = [];
  deliveries: MaterialDelivery[] = [];
  
  loading = true;
  error = '';
  
  totalPoValue = 0;
  pendingDeliveriesCount = 0;
  totalPaymentsReceived = 0;

  invoiceForm: FormGroup;
  selectedPoForInvoice: string | null = null;

  get isVendorRole(): boolean {
    return this.auth.currentUser?.role === 'Vendor';
  }

  get canImpersonate(): boolean {
    const role = this.auth.currentUser?.role;
    return role === 'Administrator' || role === 'Project Manager';
  }

  constructor(
    private data: ProcurementDataService,
    private auth: AuthDataService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.invoiceForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      gst: [0, Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    
    this.data.getVendors().subscribe({
      next: vendors => {
        if (this.isVendorRole) {
          // Find vendor by email matching current user email
          const userEmail = this.auth.currentUser?.email;
          this.vendor = vendors.find(v => v.email === userEmail) || null;
          if (!this.vendor) {
            this.error = 'No vendor profile linked to this account email.';
            this.loading = false;
            return;
          }
        } else if (this.canImpersonate && routeId) {
          // Admin viewing specific vendor dashboard
          this.vendor = vendors.find(v => v.id === routeId) || null;
          if (!this.vendor) {
            this.error = 'Vendor not found.';
            this.loading = false;
            return;
          }
        } else {
          this.error = 'Unauthorized to view this dashboard.';
          this.loading = false;
          return;
        }

        this.loadVendorData();
      },
      error: err => {
        this.error = err.message;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadVendorData() {
    if (!this.vendor) return;

    this.data.getPurchaseOrders().subscribe(pos => {
      this.purchaseOrders = pos.filter(p => p.vendorId === this.vendor!.id);
      this.totalPoValue = this.purchaseOrders.reduce((sum, p) => sum + p.totalAmount, 0);
      
      this.data.getDeliveries().subscribe(dels => {
        // Find deliveries related to this vendor's POs
        const vendorPoIds = new Set(this.purchaseOrders.map(p => p.id));
        this.deliveries = dels.filter(d => vendorPoIds.has(d.poId));
        this.pendingDeliveriesCount = this.purchaseOrders.filter(p => p.status === 'Sent' || p.status === 'Accepted').length;
      });
    });

    this.data.getInvoices().subscribe(invs => {
      this.invoices = invs.filter(i => i.vendorId === this.vendor!.id);
      this.totalPaymentsReceived = this.invoices
        .filter(i => i.paymentStatus === 'Paid')
        .reduce((sum, i) => sum + i.amount, 0);
        
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  poStatusClass(status: string) {
    return { Created: 'gray', Sent: 'blue', Accepted: 'orange', Invoiced: 'purple', Delivered: 'green', Received: 'green' }[status] || 'gray';
  }

  acceptOrder(poId: string) {
    this.data.updatePurchaseOrder(poId, { status: 'Accepted' }).subscribe({
      next: () => {
        this.loadVendorData();
      },
      error: err => {
        this.error = err.message;
        this.cdr.detectChanges();
      }
    });
  }

  rejectOrder(poId: string) {
    this.data.updatePurchaseOrder(poId, { status: 'Rejected' }).subscribe({
      next: () => {
        this.loadVendorData();
      },
      error: err => {
        this.error = err.message;
        this.cdr.detectChanges();
      }
    });
  }

  openInvoiceForm(po: PurchaseOrder) {
    this.selectedPoForInvoice = po.id;
    this.invoiceForm.patchValue({
      amount: po.totalAmount,
      date: new Date().toISOString().split('T')[0]
    });
    this.cdr.detectChanges();
  }

  submitInvoice() {
    if (this.invoiceForm.invalid || !this.selectedPoForInvoice || !this.vendor) {
      this.invoiceForm.markAllAsTouched();
      this.error = "Please fill in all required fields correctly.";
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    const v = this.invoiceForm.value;
    this.data.createInvoice({ 
      vendorId: this.vendor.id,
      purchaseOrderId: this.selectedPoForInvoice, 
      amount: v.amount,
      gst: v.gst,
      date: v.date
    }).subscribe({
      next: () => {
        this.data.updatePurchaseOrder(this.selectedPoForInvoice!, { status: 'Invoiced' }).subscribe({
          next: () => {
            this.selectedPoForInvoice = null;
            this.invoiceForm.reset();
            this.loadVendorData();
          },
          error: err => {
            this.error = "Error updating order: " + err.message;
            this.cdr.detectChanges();
          }
        });
      },
      error: err => {
        this.error = "Error creating invoice: " + err.message;
        this.cdr.detectChanges();
      }
    });
  }
}
