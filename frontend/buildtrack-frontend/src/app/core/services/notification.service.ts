import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, timer, of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthDataService } from '../../features/auth/auth-data.service';

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  private _notifications = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this._notifications.asObservable();

  private pollSub?: Subscription;

  constructor(private http: HttpClient, private auth: AuthDataService) {
    // Start/stop polling based on auth state
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.startPolling();
      } else {
        this.stopPolling();
        this._notifications.next([]);
      }
    });
  }

  private startPolling() {
    this.stopPolling(); // clear any existing poll
    this.pollSub = timer(0, 15000).pipe(
      switchMap(() => {
        const token = this.auth.token;
        if (!token) return of([]);
        return this.http.get<AppNotification[]>(this.apiUrl, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        }).pipe(catchError(() => of([])));
      })
    ).subscribe(data => this._notifications.next(data));
  }

  private stopPolling() {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }

  markAsRead(id: number): Observable<AppNotification> {
    return this.http.put<AppNotification>(
      `${this.apiUrl}/${id}/read`, {},
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` }) }
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/mark-all-read`, {},
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` }) }
    );
  }

  deleteAll(): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` }) }
    );
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` }) }
    );
  }


  /** Call after a procurement action to immediately refresh notifications */
  refresh() {
    const token = this.auth.token;
    if (!token) return;
    this.http.get<AppNotification[]>(this.apiUrl, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    }).pipe(catchError(() => of([]))).subscribe(data => this._notifications.next(data));
  }
}
