import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '@core/models/interface';
import { ApiEnvelope } from '@core/models/api-envelope';
import { LocalStorageService } from '@shared/services';

interface LoginResponse {
  token: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
  };
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  protected http = inject(HttpClient);
  private store = inject(LocalStorageService);

  login(username: string, password: string, _rememberMe = false) {
    return this.http
      .post<ApiEnvelope<LoginResponse>>(`${environment.apiUrl}/auth/login`, {
        username,
        password,
      })
      .pipe(map((res) => res.data));
  }

  refresh(refreshToken: string) {
    return this.http
      .post<ApiEnvelope<LoginResponse>>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(map((res) => res.data));
  }

  logout() {
    this.store.clear();
    return this.http.post(`${environment.apiUrl}/auth/logout`, {});
  }

  user(): Observable<User> {
    return this.http
      .get<ApiEnvelope<User>>(`${environment.apiUrl}/auth/me`)
      .pipe(map((res) => res.data));
  }
}
