import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { CreateServicio, Servicio, UpdateServicio } from './servicio.model';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/servicios`;

  findAll() {
    return this.http
      .get<ApiEnvelope<Servicio[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateServicio) {
    return this.http
      .post<ApiEnvelope<Servicio>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateServicio) {
    return this.http
      .patch<ApiEnvelope<Servicio>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.http
      .delete<ApiEnvelope<{ success: boolean }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
