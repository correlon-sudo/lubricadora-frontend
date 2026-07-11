import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { Configuracion, UpdateConfiguracion } from './configuracion.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/configuracion`;

  get() {
    return this.http
      .get<ApiEnvelope<Configuracion>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  update(dto: UpdateConfiguracion) {
    return this.http
      .patch<ApiEnvelope<Configuracion>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }
}
