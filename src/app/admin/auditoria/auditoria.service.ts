import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import { AuditoriaPage, FindAuditoriaFiltros } from './auditoria.model';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auditoria`;

  findAll(filtros: FindAuditoriaFiltros = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filtros)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http
      .get<ApiEnvelope<AuditoriaPage>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }
}
