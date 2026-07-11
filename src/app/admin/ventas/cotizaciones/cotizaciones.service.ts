import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { Venta } from '../venta.model';
import { Cotizacion, ConvertirCotizacion, CreateCotizacion } from './cotizacion.model';

@Injectable({ providedIn: 'root' })
export class CotizacionesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/cotizaciones`;

  findAll() {
    return this.http
      .get<ApiEnvelope<Cotizacion[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateCotizacion) {
    return this.http
      .post<ApiEnvelope<Cotizacion>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  convertir(id: string, dto: ConvertirCotizacion) {
    return this.http
      .post<ApiEnvelope<Venta>>(`${this.baseUrl}/${id}/convertir`, dto)
      .pipe(map((res) => res.data));
  }

  reportePdf(id: string) {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
