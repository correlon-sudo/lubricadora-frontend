import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { Cliente, CreateCliente, UpdateCliente } from './cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/clientes`;

  findAll(search?: string) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http
      .get<ApiEnvelope<Cliente[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  create(dto: CreateCliente) {
    return this.http
      .post<ApiEnvelope<Cliente>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateCliente) {
    return this.http
      .patch<ApiEnvelope<Cliente>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.http
      .delete<ApiEnvelope<{ success: boolean }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
