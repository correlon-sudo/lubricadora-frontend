import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import {
  AjusteInventario,
  FindMovimientosFiltros,
  MovimientosPage,
} from './movimiento.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/inventario`;

  movimientos(filtros: FindMovimientosFiltros = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filtros)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http
      .get<ApiEnvelope<MovimientosPage>>(`${this.baseUrl}/movimientos`, {
        params,
      })
      .pipe(map((res) => res.data));
  }

  ajustar(dto: AjusteInventario) {
    return this.http
      .post<ApiEnvelope<unknown>>(`${this.baseUrl}/ajuste`, dto)
      .pipe(map((res) => res.data));
  }
}
