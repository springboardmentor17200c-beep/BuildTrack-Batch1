// ADDITIONS to procurement.model.ts — append these to your existing file
// (the one with Vendor / ProcurementRequest already in it). Do not
// replace the whole file — just add everything below to the end of it.

export type PoStatus = 'Draft' | 'Sent' | 'Fulfilled' | 'Cancelled';

export interface PurchaseOrder {
  poId: number;
  procurementRequestId: number;
  vendorId: number;
  poNumber: string;
  generatedBy: number;
  generatedDate: string | null;
  sentDate: string | null;
  poStatus: PoStatus;
  remarks: string | null;
}

export interface PurchaseOrderCreatePayload {
  procurementRequestId: number;
  vendorId: number;
  remarks?: string;
}

export interface PurchaseOrderUpdatePayload {
  poStatus?: PoStatus;
  remarks?: string;
}

export type QualityStatus = 'Pending' | 'Passed' | 'Failed';

export interface MaterialReceipt {
  receiptId: number;
  poId: number;
  receivedBy: number;
  receivedDate: string | null;
  quantityReceived: string;
  qualityStatus: QualityStatus;
  inventoryUpdated: boolean;
  remarks: string | null;
}

export interface MaterialReceiptCreatePayload {
  poId: number;
  quantityReceived: string;
  qualityStatus?: QualityStatus;
  remarks?: string;
}

export interface MaterialReceiptUpdatePayload {
  quantityReceived?: string;
  qualityStatus?: QualityStatus;
  inventoryUpdated?: boolean;
  remarks?: string;
}

export type InvoiceVerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface ProcurementInvoice {
  invoiceId: number;
  poId: number;
  invoiceNumber: string;
  invoiceAmount: number;
  invoiceDate: string | null;
  uploadedBy: number;
  verificationStatus: InvoiceVerificationStatus;
}

export interface ProcurementInvoiceCreatePayload {
  poId: number;
  invoiceNumber: string;
  invoiceAmount: number;
}

export type PaymentStatus = 'Pending' | 'Paid';

export interface ProcurementPayment {
  paymentId: number;
  invoiceId: number;
  paymentDate: string | null;
  paymentAmount: number;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  paidBy: number | null;
}

export interface ProcurementPaymentCreatePayload {
  invoiceId: number;
  paymentAmount: number;
  paymentMethod?: string;
}
