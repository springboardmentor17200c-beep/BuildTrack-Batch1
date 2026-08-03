import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { API_ENDPOINTS } from './endpoints';

@Injectable({
  providedIn: 'root',
})
export class LookupService {
  private readonly api = inject(ApiService);

  getLookups(): Observable<any> {
    return this.api.get<any>(API_ENDPOINTS.LOOKUPS.BASE);
  }
}
