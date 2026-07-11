import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import {
  CreateVehiculo,
  UpdateVehiculo,
  Vehiculo,
  VehiculoConHistorial,
} from './vehiculo.model';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/vehiculos`;

  findAll(search?: string) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http
      .get<ApiEnvelope<Vehiculo[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  findByPlaca(placa: string) {
    return this.http
      .get<ApiEnvelope<VehiculoConHistorial>>(`${this.baseUrl}/placa/${placa}`)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateVehiculo) {
    return this.http
      .post<ApiEnvelope<Vehiculo>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateVehiculo) {
    return this.http
      .patch<ApiEnvelope<Vehiculo>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.http
      .delete<ApiEnvelope<{ success: boolean }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
