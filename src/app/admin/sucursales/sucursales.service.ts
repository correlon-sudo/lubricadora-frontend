import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { CreateSucursal, Sucursal, UpdateSucursal } from './sucursal.model';

@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/sucursales`;

  findAll() {
    return this.http
      .get<ApiEnvelope<Sucursal[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateSucursal) {
    return this.http
      .post<ApiEnvelope<Sucursal>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateSucursal) {
    return this.http
      .patch<ApiEnvelope<Sucursal>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.http
      .delete<ApiEnvelope<{ success: boolean }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
