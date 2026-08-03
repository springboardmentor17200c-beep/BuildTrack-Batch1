import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { API_ENDPOINTS } from './endpoints';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly api = inject(ApiService);

  getCompanies(): Observable<any[]> {
    return this.api.get<any[]>(API_ENDPOINTS.COMPANIES.BASE);
  }

  getCompany(id: number): Observable<any> {
    return this.api.get<any>(API_ENDPOINTS.COMPANIES.DETAILS(id));
  }
}
