import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { first, switchMap } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)

  return authService.authorization$.pipe(
    first(),
    switchMap(token => next(req.clone({
      headers: token ? req.headers.append('Authorization', token) : req.headers
    })))
  )
};
