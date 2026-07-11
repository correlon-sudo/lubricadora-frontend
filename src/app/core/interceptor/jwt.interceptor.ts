import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../service/token.service';

export const jwtInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);

  const isAuthEndpoint =
    req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
  const isApiRequest = req.url.startsWith(environment.apiUrl) && !isAuthEndpoint;

  if (isApiRequest) {
    const bearer = tokenService.getBearerToken();
    if (bearer) {
      req = req.clone({ setHeaders: { Authorization: bearer } });
    }
  }

  return next(req);
};
