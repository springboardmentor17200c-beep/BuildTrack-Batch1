import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
  Vendor, VendorCreatePayload,
  MaterialRequest, MaterialRequestCreatePayload,
  PurchaseOrder, PurchaseOrderCreatePayload,
  MaterialDelivery, MaterialDeliveryCreatePayload,
  Invoice, InvoiceCreatePayload,
  InventoryItem
} from './models/procurement.model';

const TOKEN_KEY = 'buildtrack_access_token';

@Injectable({
  providedIn: 'root'
})
export class ProcurementDataService {
  private apiUrl = `${environment.apiUrl}/procurement`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem(TOKEN_KEY);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private handleError = (err: HttpErrorResponse) => {
    const detail = err.error?.detail;
    const message = typeof detail === 'string' ? detail : 'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  };

  // =========================
  // VENDORS
  // =========================
  getVendors(): Observable<Vendor[]> {
    return this.http
      .get<Vendor[]>(`${environment.apiUrl}/vendors`, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  getVendor(id: string): Observable<Vendor> {
    return this.http
      .get<Vendor>(`${environment.apiUrl}/vendors/${id}`, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  createVendor(payload: VendorCreatePayload): Observable<Vendor> {
    return this.http
      .post<Vendor>(`${environment.apiUrl}/vendors`, payload, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateVendor(id: string, payload: Partial<VendorCreatePayload>): Observable<Vendor> {
    return this.http
      .put<Vendor>(`${environment.apiUrl}/vendors/${id}`, payload, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteVendor(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/vendors/${id}`, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  // =========================
  // MATERIAL REQUESTS
  // =========================
  getProcurementRequests(): Observable<MaterialRequest[]> {
    return this.http
      .get<MaterialRequest[]>(`${this.apiUrl}/requests`, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  createProcurementRequest(payload: MaterialRequestCreatePayload): Observable<MaterialRequest> {
    return this.http
      .post<MaterialRequest>(`${this.apiUrl}/requests`, payload, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  approveRequest(id: string, comments?: string): Observable<MaterialRequest> {
    return this.http
      .put<MaterialRequest>(`${this.apiUrl}/requests/${id}/approve`, null, { 
        headers: this.authHeaders(),
        params: comments ? { comments } : {} 
      })
      .pipe(catchError(this.handleError));
  }

  rejectRequest(id: string, comments?: string): Observable<MaterialRequest> {
    return this.http
      .put<MaterialRequest>(`${this.apiUrl}/requests/${id}/reject`, null, { 
        headers: this.authHeaders(),
        params: comments ? { comments } : {} 
      })
      .pipe(catchError(this.handleError));
  }

  selectVendorForRequest(id: string, vendorId: string): Observable<MaterialRequest> {
    return this.http
      .put<MaterialRequest>(`${this.apiUrl}/requests/${id}/select-vendor`, null, {
        headers: this.authHeaders(),
        params: { vendor_id: vendorId }
      })
      .pipe(catchError(this.handleError));
  }

  // =========================
  // PURCHASE ORDERS
  // =========================
  getPurchaseOrders(): Observable<PurchaseOrder[]> {
    return this.http
      .get<PurchaseOrder[]>(`${this.apiUrl}/purchase-orders`, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  createPurchaseOrder(payload: PurchaseOrderCreatePayload): Observable<PurchaseOrder> {
    return this.http
      .post<PurchaseOrder>(`${this.apiUrl}/purchase-orders`, payload, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  updatePurchaseOrder(id: string, payload: any): Observable<PurchaseOrder> {
    return this.http
      .put<PurchaseOrder>(`${this.apiUrl}/purchase-orders/${id}`, payload, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  // =========================
  // MATERIAL DELIVERIES & INVENTORY
  // =========================
  getDeliveries(): Observable<MaterialDelivery[]> {
    return this.http
      .get<MaterialDelivery[]>(`${this.apiUrl}/deliveries`, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  createDelivery(payload: MaterialDeliveryCreatePayload): Observable<MaterialDelivery> {
    return this.http
      .post<MaterialDelivery>(`${this.apiUrl}/deliveries`, payload, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  getInventory(): Observable<InventoryItem[]> {
    return this.http
      .get<InventoryItem[]>(`${this.apiUrl}/inventory`, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  // =========================
  // INVOICES & PAYMENTS
  // =========================
  getInvoices(): Observable<Invoice[]> {
    return this.http
      .get<Invoice[]>(`${this.apiUrl}/invoices`, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  createInvoice(payload: InvoiceCreatePayload): Observable<Invoice> {
    return this.http
      .post<Invoice>(`${this.apiUrl}/invoices`, payload, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }

  payInvoice(id: string): Observable<Invoice> {
    return this.http
      .put<Invoice>(`${this.apiUrl}/invoices/${id}/payment`, null, { headers: this.authHeaders() })
      .pipe(catchError(this.handleError));
  }
}
