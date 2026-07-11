export type TipoSueldo = 'SEMANAL' | 'MENSUAL';
export type EstadoAsistencia = 'PRESENTE' | 'FALTA' | 'PERMISO' | 'MEDIO_DIA';
export type EstadoNomina = 'PENDIENTE' | 'PAGADO';

export interface Colaborador {
  id: string;
  sucursalId: string;
  usuarioId: string | null;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono: string | null;
  direccion: string | null;
  email: string | null;
  cargo: string | null;
  fotoUrl: string | null;
  tipoSueldo: TipoSueldo;
  montoSueldo: number;
  fechaIngreso: string;
  activo: boolean;
  sucursal: { nombre: string };
}

export interface CreateColaborador {
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  cargo?: string;
  tipoSueldo: TipoSueldo;
  montoSueldo: number;
  fechaIngreso: string;
}

export type UpdateColaborador = Partial<CreateColaborador>;

export interface Adelanto {
  id: string;
  colaboradorId: string;
  monto: number;
  motivo: string | null;
  fecha: string;
  usuarioRegistraId: string;
}

export interface CreateAdelanto {
  monto: number;
  motivo?: string;
}

export interface Asistencia {
  id: string;
  colaboradorId: string;
  fecha: string;
  estado: EstadoAsistencia;
  observacion: string | null;
}

export interface CreateAsistencia {
  fecha: string;
  estado: EstadoAsistencia;
  observacion?: string;
}

export interface Nomina {
  id: string;
  colaboradorId: string;
  periodoInicio: string;
  periodoFin: string;
  sueldoBase: number;
  totalAdelantos: number;
  totalDescuentos: number;
  netoPagar: number;
  estado: EstadoNomina;
  fechaPago: string | null;
}
