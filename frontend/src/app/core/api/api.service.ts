// src/app/core/api/api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: Record<string, unknown>, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      params: this.buildParams(params),
      headers,
    });
  }

  post<T>(endpoint: string, body?: unknown, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers });
  }

  put<T>(endpoint: string, body?: unknown, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body, { headers });
  }

  patch<T>(endpoint: string, body?: unknown, headers?: HttpHeaders): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, body, { headers });
  }

  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers });
  }

  private buildParams(params?: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();

    if (!params) {
      return httpParams;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}
