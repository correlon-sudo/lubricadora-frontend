import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { CreateUsuario, UpdateUsuario, Usuario } from './usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/usuarios`;

  findAll() {
    return this.http
      .get<ApiEnvelope<Usuario[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateUsuario) {
    return this.http
      .post<ApiEnvelope<Usuario>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateUsuario) {
    return this.http
      .patch<ApiEnvelope<Usuario>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  updatePassword(id: string, password: string) {
    return this.http
      .patch<ApiEnvelope<{ success: boolean }>>(
        `${this.baseUrl}/${id}/password`,
        { password },
      )
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.http
      .delete<ApiEnvelope<{ success: boolean }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
