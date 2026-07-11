import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { CreateTransferencia, Transferencia } from './transferencia.model';

@Injectable({ providedIn: 'root' })
export class TransferenciasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/transferencias`;

  findAll() {
    return this.http
      .get<ApiEnvelope<Transferencia[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateTransferencia) {
    return this.http
      .post<ApiEnvelope<Transferencia>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  enviar(id: string) {
    return this.http
      .patch<ApiEnvelope<Transferencia>>(`${this.baseUrl}/${id}/enviar`, {})
      .pipe(map((res) => res.data));
  }

  recibir(id: string) {
    return this.http
      .patch<ApiEnvelope<Transferencia>>(`${this.baseUrl}/${id}/recibir`, {})
      .pipe(map((res) => res.data));
  }

  anular(id: string) {
    return this.http
      .patch<ApiEnvelope<Transferencia>>(`${this.baseUrl}/${id}/anular`, {})
      .pipe(map((res) => res.data));
  }

  reportePdf(id: string) {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
