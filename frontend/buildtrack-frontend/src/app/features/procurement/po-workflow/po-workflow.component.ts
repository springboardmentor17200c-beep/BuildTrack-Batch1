import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppSidebarComponent } from '../../shared/sidebar/app-sidebar.component';
import { ProcurementDataService } from '../procurement-data.service';
import { AuthDataService } from '../../auth/auth-data.service';
import {
  MaterialRequest,
  Vendor,
  PurchaseOrder,
  MaterialDelivery,
  Invoice,
} from '../models/procurement.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-po-workflow',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AppSidebarComponent],
  templateUrl: './po-workflow.component.html',
  styleUrls: ['./po-workflow.component.css'],
})
export class PoWorkflowComponent implements OnInit {
  approvedRequests: MaterialRequest[] = [];
  vendors: Vendor[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  deliveries: MaterialDelivery[] = [];
  invoices: Invoice[] = [];

  loading = true;
  error = '';

  selectedPoId: string | null = null;

  selectVendorForm: FormGroup;
  createPoForm: FormGroup;
  receiptForm: FormGroup;
  invoiceForm: FormGroup;

  get canManagePo(): boolean {
    const role = this.auth.currentUser?.role;
    return role === 'Administrator';
  }
  
  get canReceive(): boolean {
    return this.auth.currentUser?.role === 'Administrator' || this.auth.currentUser?.role === 'Site Engineer';
  }

  get selectedPo(): PurchaseOrder | undefined {
    return this.purchaseOrders.find(p => p.id === this.selectedPoId);
  }

  get selectedDelivery(): MaterialDelivery | undefined {
    return this.deliveries.find(d => d.poId === this.selectedPoId);
  }

  get selectedInvoice(): Invoice | undefined {
    return this.invoices.find(i => i.purchaseOrderId === this.selectedPoId);
  }

  vendorName(vendorId: string): string {
    return this.vendors.find(v => v.id === vendorId)?.vendorName || 'Unknown Vendor';
  }

  constructor(
    private data: ProcurementDataService, 
    private fb: FormBuilder, 
    private auth: AuthDataService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.selectVendorForm = this.fb.group({
      requestId: ['', Validators.required],
      vendorId: ['', Validators.required]
    });

    this.createPoForm = this.fb.group({
      requestId: ['', Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      expectedDeliveryDate: ['', Validators.required]
    });

    this.receiptForm = this.fb.group({
      material: ['', Validators.required],
      acceptedQuantity: [1, Validators.required],
      rejectedQuantity: [0, Validators.required],
      deliveryDate: ['', Validators.required]
    });

    this.invoiceForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      gst: [0, Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    
    this.data.getProcurementRequests().subscribe({
      next: reqs => (this.approvedRequests = reqs),
      error: err => (this.error = err.message),
    });
    this.data.getVendors().subscribe({
      next: v => (this.vendors = v),
      error: err => (this.error = err.message),
    });
    this.data.getPurchaseOrders().subscribe({
      next: pos => {
        this.purchaseOrders = pos;
        this.loading = false;
        
        // Handle route selection after data is loaded
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          const matchedPo = pos.find(po => po.id === id);
          if (matchedPo) {
            this.selectedPoId = id;
            this.invoiceForm.patchValue({ amount: matchedPo.totalAmount, date: new Date().toISOString().split('T')[0] });
          } else {
            const poFromReq = pos.find(po => po.requestId === id);
            if (poFromReq) {
              this.selectedPoId = poFromReq.id;
              this.invoiceForm.patchValue({ amount: poFromReq.totalAmount, date: new Date().toISOString().split('T')[0] });
            } else {
              this.selectVendorForm.patchValue({ requestId: id });
              this.createPoForm.patchValue({ requestId: id });
            }
          }
        } else if (!this.selectedPoId && pos.length > 0) {
          this.selectedPoId = pos[0].id;
        }
        this.cdr.detectChanges();
      },
      error: err => {
        this.error = err.message;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
    // Fetch deliveries & invoices
    this.data.getDeliveries().subscribe({ next: d => (this.deliveries = d) });
    this.data.getInvoices().subscribe({ next: i => (this.invoices = i) });
  }

  get pmApprovedRequests() {
    return this.approvedRequests.filter(r => r.status === 'PM Approved' || r.status === 'Approved');
  }

  get vendorSelectedRequests() {
    return this.approvedRequests.filter(r => r.status === 'Vendor Selected');
  }

  selectPo(id: string) {
    if (this.selectedPoId === id) {
      this.router.navigate(['/procurement/workflow']);
    } else {
      this.router.navigate(['/procurement/workflow', id]);
    }
  }

  selectVendor() {
    if (this.selectVendorForm.invalid) {
      this.selectVendorForm.markAllAsTouched();
      return;
    }
    const v = this.selectVendorForm.value;
    this.data.selectVendorForRequest(v.requestId, v.vendorId).subscribe({
      next: () => {
        this.selectVendorForm.reset();
        this.loadAll();
      },
      error: err => (this.error = err.message),
    });
  }

  createPo() {
    if (this.createPoForm.invalid) {
      this.createPoForm.markAllAsTouched();
      return;
    }
    const v = this.createPoForm.value;
    const req = this.approvedRequests.find(r => r.id === v.requestId);
    if (!req || !req.vendorId) return;

    const totalAmount = req.quantity * v.unitPrice;
    
    this.data.createPurchaseOrder({ 
      requestId: req.id, 
      vendorId: req.vendorId, 
      materials: [req.material],
      quantity: req.quantity,
      unitPrice: v.unitPrice,
      totalAmount: totalAmount,
      expectedDeliveryDate: v.expectedDeliveryDate
    }).subscribe({
      next: po => {
        this.createPoForm.reset({ unitPrice: 0 });
        this.loadAll();
        this.selectedPoId = po.id;
      },
      error: err => (this.error = err.message),
    });
  }

  sendPo() {
    const po = this.selectedPo;
    if (!po) return;
    this.data.updatePurchaseOrder(po.id, { status: 'Sent' }).subscribe({
      next: () => this.loadAll(),
      error: err => (this.error = err.message),
    });
  }

  submitDelivery() {
    const po = this.selectedPo;
    if (!po || this.receiptForm.invalid) {
      this.receiptForm.markAllAsTouched();
      return;
    }
    const v = this.receiptForm.value;
    this.data.createDelivery({ 
      poId: po.id, 
      material: v.material, 
      quantity: po.quantity,
      acceptedQuantity: v.acceptedQuantity,
      rejectedQuantity: v.rejectedQuantity,
      deliveryDate: v.deliveryDate,
      status: v.rejectedQuantity > 0 && v.acceptedQuantity === 0 ? 'Rejected' : (v.acceptedQuantity < po.quantity ? 'Partially Received' : 'Received')
    }).subscribe({
      next: () => {
        this.data.updatePurchaseOrder(po.id, { status: 'Delivered' }).subscribe(() => {
          this.receiptForm.reset({ acceptedQuantity: 1, rejectedQuantity: 0 });
          this.loadAll();
        });
      },
      error: err => (this.error = err.message),
    });
  }

  submitInvoice() {
    const po = this.selectedPo;
    if (!po || this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }
    const v = this.invoiceForm.value;
    this.data.createInvoice({ 
      vendorId: po.vendorId,
      purchaseOrderId: po.id, 
      amount: v.amount,
      gst: v.gst,
      date: v.date
    }).subscribe({
      next: () => {
        // Form is reset, but if they want to create another invoice they can.
        // Usually it's just one invoice per PO. We can keep the amount for convenience if we don't reset it.
        this.loadAll();
      },
      error: err => (this.error = err.message),
    });
  }

  payInvoice() {
    const inv = this.selectedInvoice;
    if (!inv) return;
    this.data.payInvoice(inv.id).subscribe({
      next: () => this.loadAll(),
      error: err => (this.error = err.message),
    });
  }

  poStatusClass(status: string) {
    return { Created: 'gray', Sent: 'blue', Accepted: 'orange', Invoiced: 'purple', Delivered: 'green', Received: 'green' }[status] || 'gray';
  }

  generateInvoicePdf() {
    const inv = this.selectedInvoice;
    const po = this.selectedPo;
    if (!inv || !po) return;

    const vendor = this.vendors.find(v => v.id === po.vendorId);
    const req = this.approvedRequests.find(r => r.id === po.requestId);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Company Header
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // BuildTrack Blue
    doc.text('BuildTrack Construction', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('123 Skyline Boulevard', 14, 30);
    doc.text('Metro City, ST 12345', 14, 35);
    doc.text('support@buildtrack.com | (555) 123-4567', 14, 40);

    // Invoice Meta
    doc.setFontSize(20);
    doc.setTextColor(0);
    doc.text('INVOICE', pageWidth - 14, 22, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice Number: ${inv.invoiceNo}`, pageWidth - 14, 30, { align: 'right' });
    doc.text(`Date: ${new Date(inv.date).toLocaleDateString()}`, pageWidth - 14, 35, { align: 'right' });
    doc.text(`Status: PAID`, pageWidth - 14, 40, { align: 'right' });
    if (inv.paymentDate) doc.text(`Paid On: ${new Date(inv.paymentDate).toLocaleDateString()}`, pageWidth - 14, 45, { align: 'right' });
    if (inv.paymentRef) doc.text(`Ref: ${inv.paymentRef}`, pageWidth - 14, 50, { align: 'right' });

    // Separator
    doc.setDrawColor(200);
    doc.line(14, 55, pageWidth - 14, 55);

    // Bill To & Ship To
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('Vendor Information:', 14, 65);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(vendor?.vendorName || 'Unknown Vendor', 14, 71);
    doc.text(vendor?.contactPerson || '', 14, 76);
    doc.text(vendor?.email || '', 14, 81);
    doc.text(vendor?.phone || '', 14, 86);

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('Project & Order Details:', pageWidth / 2, 65);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Project ID: ${req?.projectId || 'N/A'}`, pageWidth / 2, 71);
    doc.text(`PO Number: ${po.poNumber}`, pageWidth / 2, 76);
    doc.text(`Request ID: ${req?.id || 'N/A'}`, pageWidth / 2, 81);

    // Materials Table
    const tableData = [
      [req?.material || 'Material', po.quantity.toString(), `₹${po.unitPrice.toFixed(2)}`, `₹${po.totalAmount.toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175] }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Subtotal:', pageWidth - 60, finalY);
    doc.setTextColor(0);
    doc.text(`₹${po.totalAmount.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });

    doc.setTextColor(100);
    doc.text(`Tax (${inv.gst}%):`, pageWidth - 60, finalY + 7);
    doc.setTextColor(0);
    const taxAmount = po.totalAmount * (inv.gst / 100);
    doc.text(`₹${taxAmount.toFixed(2)}`, pageWidth - 14, finalY + 7, { align: 'right' });

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Grand Total:', pageWidth - 60, finalY + 17);
    const grandTotal = po.totalAmount + taxAmount;
    doc.text(`₹${grandTotal.toFixed(2)}`, pageWidth - 14, finalY + 17, { align: 'right' });

    // Paid Stamp
    doc.setFontSize(40);
    doc.setTextColor(34, 197, 94); // Green
    doc.setGState(new (doc as any).GState({opacity: 0.2}));
    doc.text('PAID', pageWidth / 2, finalY + 10, { align: 'center', angle: -20 });
    doc.setGState(new (doc as any).GState({opacity: 1}));

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for doing business with BuildTrack.', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });

    doc.save(`Invoice_${inv.invoiceNo}.pdf`);
  }
}
