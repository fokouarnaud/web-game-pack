import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '@core/services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const storageService = inject(StorageService);
  const token = storageService.getAccessToken();

  // Skip auth for certain URLs
  const skipAuth = req.url.includes('/auth/login') || 
                   req.url.includes('/auth/register') ||
                   req.url.includes('/auth/refresh');

  if (token && !skipAuth) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};