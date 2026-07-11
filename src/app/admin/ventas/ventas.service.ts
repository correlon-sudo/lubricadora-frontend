import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { CreateVenta, Venta } from './venta.model';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/ventas`;

  findAll() {
    return this.http
      .get<ApiEnvelope<Venta[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  findOne(id: string) {
    return this.http
      .get<ApiEnvelope<Venta>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateVenta) {
    return this.http
      .post<ApiEnvelope<Venta>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  anular(id: string) {
    return this.http
      .patch<ApiEnvelope<Venta>>(`${this.baseUrl}/${id}/anular`, {})
      .pipe(map((res) => res.data));
  }

  reportePdf(id: string) {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
