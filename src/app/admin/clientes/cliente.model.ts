export type TipoIdentificacion = 'CEDULA' | 'RUC' | 'PASAPORTE';

export interface Cliente {
  id: string;
  tipoIdentificacion: TipoIdentificacion;
  identificacion: string;
  nombres: string;
  apellidos: string | null;
  razonSocial: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  esConsumidorFinal: boolean;
  activo: boolean;
}

export interface CreateCliente {
  tipoIdentificacion: TipoIdentificacion;
  identificacion: string;
  nombres: string;
  apellidos?: string;
  razonSocial?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export type UpdateCliente = Partial<CreateCliente>;
