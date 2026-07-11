export interface RegistroAuditoria {
  id: string;
  usuarioId: string;
  accion: string;
  entidad: string;
  entidadId: string;
  detalle: Record<string, unknown> | null;
  ip: string | null;
  fecha: string;
  usuario: { nombres: string; apellidos: string; username: string };
}

export interface AuditoriaPage {
  items: RegistroAuditoria[];
  total: number;
  page: number;
  limit: number;
}

export interface FindAuditoriaFiltros {
  entidad?: string;
  usuarioId?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
}
