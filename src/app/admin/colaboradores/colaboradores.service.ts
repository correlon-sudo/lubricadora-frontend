import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '@core/models/api-envelope';
import {
  Adelanto,
  Asistencia,
  Colaborador,
  CreateAdelanto,
  CreateAsistencia,
  CreateColaborador,
  Nomina,
  UpdateColaborador,
} from './colaborador.model';

@Injectable({ providedIn: 'root' })
export class ColaboradoresService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/colaboradores`;

  findAll() {
    return this.http
      .get<ApiEnvelope<Colaborador[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  create(dto: CreateColaborador) {
    return this.http
      .post<ApiEnvelope<Colaborador>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateColaborador) {
    return this.http
      .patch<ApiEnvelope<Colaborador>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.http
      .delete<ApiEnvelope<{ success: boolean }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  subirFoto(id: string, file: File) {
    const formData = new FormData();
    formData.append('foto', file);
    return this.http
      .post<ApiEnvelope<Colaborador>>(`${this.baseUrl}/${id}/foto`, formData)
      .pipe(map((res) => res.data));
  }

  crearAdelanto(id: string, dto: CreateAdelanto) {
    return this.http
      .post<ApiEnvelope<Adelanto>>(`${this.baseUrl}/${id}/adelantos`, dto)
      .pipe(map((res) => res.data));
  }

  findAdelantos(id: string) {
    return this.http
      .get<ApiEnvelope<Adelanto[]>>(`${this.baseUrl}/${id}/adelantos`)
      .pipe(map((res) => res.data));
  }

  crearAsistencia(id: string, dto: CreateAsistencia) {
    return this.http
      .post<ApiEnvelope<Asistencia>>(`${this.baseUrl}/${id}/asistencias`, dto)
      .pipe(map((res) => res.data));
  }

  findAsistencias(id: string) {
    return this.http
      .get<ApiEnvelope<Asistencia[]>>(`${this.baseUrl}/${id}/asistencias`)
      .pipe(map((res) => res.data));
  }

  nomina(id: string, periodoInicio: string, periodoFin: string) {
    const params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFin', periodoFin);
    return this.http
      .get<ApiEnvelope<Nomina>>(`${this.baseUrl}/${id}/nomina`, { params })
      .pipe(map((res) => res.data));
  }

  marcarNominaPagada(nominaId: string) {
    return this.http
      .patch<ApiEnvelope<Nomina>>(`${this.baseUrl}/nomina/${nominaId}/pagar`, {})
      .pipe(map((res) => res.data));
  }
}
