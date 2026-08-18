import os

interceptor_code = """import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthDataService } from './features/auth/auth-data.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthDataService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Clear local storage and state
        auth.logout(); 
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
"""

with open('C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/auth.interceptor.ts', 'w', encoding='utf-8') as f:
    f.write(interceptor_code)

config_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/app.config.ts'
with open(config_path, 'r', encoding='utf-8') as f:
    config = f.read()

config = config.replace(
    "import { provideHttpClient, withFetch } from '@angular/common/http';",
    "import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';\nimport { authInterceptor } from './auth.interceptor';"
)

config = config.replace(
    "provideHttpClient(withFetch()),",
    "provideHttpClient(withFetch(), withInterceptors([authInterceptor])),"
)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config)

