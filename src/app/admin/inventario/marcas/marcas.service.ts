import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { CreateMarca, Marca, UpdateMarca } from './marca.model';

@Injectable({ providedIn: 'root' })
export class MarcasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/marcas`;

  findAll() {
    return this.http
      .get<ApiEnvelope<Marca[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateMarca) {
    return this.http
      .post<ApiEnvelope<Marca>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateMarca) {
    return this.http
      .patch<ApiEnvelope<Marca>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.http
      .delete<ApiEnvelope<{ success: boolean }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
