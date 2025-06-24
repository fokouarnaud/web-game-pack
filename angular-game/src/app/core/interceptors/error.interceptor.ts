import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      switch (error.status) {
        case 401:
          // Unauthorized - redirect to login
          authService.logout();
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          break;
        
        case 403:
          // Forbidden
          errorMessage = 'Accès non autorisé';
          router.navigate(['/']);
          break;
        
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        
        case 422:
          // Validation errors
          if (error.error?.errors) {
            errorMessage = Object.values(error.error.errors).flat().join(', ');
          } else {
            errorMessage = error.error?.message || 'Données invalides';
          }
          break;
        
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }

      // Show error notification (except for 401 to avoid spam)
      if (error.status !== 401) {
        notificationService.showError(errorMessage);
      }

      return throwError(() => error);
    })
  );
};