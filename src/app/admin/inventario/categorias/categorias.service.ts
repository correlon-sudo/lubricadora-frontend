import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { Categoria, CreateCategoria, UpdateCategoria } from './categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/categorias`;

  findAll() {
    return this.http
      .get<ApiEnvelope<Categoria[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateCategoria) {
    return this.http
      .post<ApiEnvelope<Categoria>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateCategoria) {
    return this.http
      .patch<ApiEnvelope<Categoria>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.http
      .delete<ApiEnvelope<{ success: boolean }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
