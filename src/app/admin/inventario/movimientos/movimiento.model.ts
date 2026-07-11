export type TipoMovimiento =
  | 'ENTRADA'
  | 'SALIDA'
  | 'AJUSTE'
  | 'TRANSFERENCIA_ENT'
  | 'TRANSFERENCIA_SAL'
  | 'VENTA'
  | 'ANULACION';

export interface MovimientoInventario {
  id: string;
  productoId: string;
  sucursalId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockResultante: number;
  referenciaTipo: string | null;
  referenciaId: string | null;
  usuarioId: string;
  fecha: string;
  producto: { codigo: string; nombre: string };
  sucursal: { nombre: string };
  usuario: { nombres: string; apellidos: string };
}

export interface MovimientosPage {
  items: MovimientoInventario[];
  total: number;
  page: number;
  limit: number;
}

export interface FindMovimientosFiltros {
  productoId?: string;
  sucursalId?: string;
  tipo?: TipoMovimiento;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
}

export interface AjusteInventario {
  productoId: string;
  sucursalId: string;
  cantidad: number;
  observacion?: string;
}
