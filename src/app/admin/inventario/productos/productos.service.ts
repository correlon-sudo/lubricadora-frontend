import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import {
  CreateProducto,
  FindProductosFiltros,
  Producto,
  ProductoStockBajo,
  UpdateProducto,
} from './producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/productos`;

  private buildParams(filtros: FindProductosFiltros = {}): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filtros)) {
      if (value) params = params.set(key, value);
    }
    return params;
  }

  findAll(filtros: FindProductosFiltros = {}) {
    return this.http
      .get<ApiEnvelope<Producto[]>>(this.baseUrl, {
        params: this.buildParams(filtros),
      })
      .pipe(map((res) => res.data));
  }

  stockBajo() {
    return this.http
      .get<ApiEnvelope<ProductoStockBajo[]>>(`${this.baseUrl}/stock-bajo`)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateProducto) {
    return this.http
      .post<ApiEnvelope<Producto>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateProducto) {
    return this.http
      .patch<ApiEnvelope<Producto>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.http
      .delete<ApiEnvelope<{ success: boolean }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  reportePdf(filtros: FindProductosFiltros = {}) {
    return this.http.get(`${this.baseUrl}/reporte/pdf`, {
      params: this.buildParams(filtros),
      responseType: 'blob',
    });
  }
}
