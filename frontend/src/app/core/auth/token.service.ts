import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'buildtrack_token';

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.token;
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }
}
