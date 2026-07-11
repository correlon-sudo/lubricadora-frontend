export type EstadoCaja = 'ABIERTA' | 'CERRADA';
export type TipoMovimientoCaja = 'INGRESO' | 'EGRESO';

export interface Caja {
  id: string;
  sucursalId: string;
  usuarioAperturaId: string;
  usuarioCierreId: string | null;
  montoInicial: number;
  fechaApertura: string;
  fechaCierre: string | null;
  estado: EstadoCaja;
  totalEfectivo: number | null;
  totalTransferencia: number | null;
  totalTarjeta: number | null;
  montoEsperado: number | null;
  montoContado: number | null;
  diferencia: number | null;
  observacion: string | null;
  sucursal: { nombre: string };
  usuarioApertura: { nombres: string; apellidos: string };
  usuarioCierre: { nombres: string; apellidos: string } | null;
}

export interface AbrirCaja {
  montoInicial: number;
}

export interface CerrarCaja {
  montoContado: number;
  observacion?: string;
}

export interface MovimientoCajaDto {
  tipo: TipoMovimientoCaja;
  monto: number;
  concepto: string;
}

export interface ReporteDiario extends Caja {
  ventas: {
    numero: string;
    total: number;
    estado: string;
    pagos: { formaPago: string; monto: number }[];
  }[];
  movimientos: {
    tipo: TipoMovimientoCaja;
    monto: number;
    concepto: string;
    fecha: string;
  }[];
}
