export interface Servicio {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  ivaAplicable: boolean;
  activo: boolean;
}

export interface CreateServicio {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  ivaAplicable?: boolean;
}

export type UpdateServicio = Partial<CreateServicio>;
