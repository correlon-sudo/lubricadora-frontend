import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import {
  Consolidado,
  DashboardResumen,
  ProductoMasVendido,
  ReporteVentas,
} from './reporte.model';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  resumen() {
    return this.http
      .get<ApiEnvelope<DashboardResumen>>(`${this.baseUrl}/dashboard/resumen`)
      .pipe(map((res) => res.data));
  }

  reporteVentas(desde: string, hasta: string) {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http
      .get<ApiEnvelope<ReporteVentas>>(`${this.baseUrl}/reportes/ventas`, { params })
      .pipe(map((res) => res.data));
  }

  productosMasVendidos(desde: string, hasta: string, limit = 10) {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('limit', limit);
    return this.http
      .get<ApiEnvelope<ProductoMasVendido[]>>(`${this.baseUrl}/reportes/productos-mas-vendidos`, {
        params,
      })
      .pipe(map((res) => res.data));
  }

  consolidado(desde: string, hasta: string) {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http
      .get<ApiEnvelope<Consolidado>>(`${this.baseUrl}/reportes/consolidado`, { params })
      .pipe(map((res) => res.data));
  }
}
