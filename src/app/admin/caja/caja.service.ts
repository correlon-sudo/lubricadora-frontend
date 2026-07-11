import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { AbrirCaja, Caja, CerrarCaja, MovimientoCajaDto, ReporteDiario } from './caja.model';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/caja`;

  actual() {
    return this.http
      .get<ApiEnvelope<Caja>>(`${this.baseUrl}/actual`)
      .pipe(map((res) => res.data));
  }

  historial() {
    return this.http
      .get<ApiEnvelope<Caja[]>>(`${this.baseUrl}/historial`)
      .pipe(map((res) => res.data));
  }

  abrir(dto: AbrirCaja) {
    return this.http
      .post<ApiEnvelope<Caja>>(`${this.baseUrl}/abrir`, dto)
      .pipe(map((res) => res.data));
  }

  cerrar(id: string, dto: CerrarCaja) {
    return this.http
      .patch<ApiEnvelope<Caja>>(`${this.baseUrl}/${id}/cerrar`, dto)
      .pipe(map((res) => res.data));
  }

  movimiento(id: string, dto: MovimientoCajaDto) {
    return this.http
      .post<ApiEnvelope<unknown>>(`${this.baseUrl}/${id}/movimiento`, dto)
      .pipe(map((res) => res.data));
  }

  reporteDiario(id: string) {
    return this.http
      .get<ApiEnvelope<ReporteDiario>>(`${this.baseUrl}/${id}/reporte-diario`)
      .pipe(map((res) => res.data));
  }

  reportePdf(id: string) {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
