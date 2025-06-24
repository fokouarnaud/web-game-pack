import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs/operators';

import { showLoading, hideLoading } from '@core/store/ui/ui.actions';
import { AppState } from '@core/store';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store<AppState>);

  // Skip loading for certain requests
  const skipLoading = req.headers.has('skip-loading') ||
                     req.url.includes('/voice/process') ||
                     req.method === 'GET' && req.url.includes('/sessions');

  if (!skipLoading) {
    store.dispatch(showLoading());
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipLoading) {
        store.dispatch(hideLoading());
      }
    })
  );
};