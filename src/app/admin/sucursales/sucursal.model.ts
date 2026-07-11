export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  esMatriz: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSucursal {
  nombre: string;
  direccion?: string;
  telefono?: string;
  esMatriz?: boolean;
}

export type UpdateSucursal = Partial<CreateSucursal>;
