export type EstadoTransferencia = 'PENDIENTE' | 'EN_TRANSITO' | 'RECIBIDA' | 'ANULADA';

export interface TransferenciaDetalle {
  id: string;
  productoId: string;
  cantidad: number;
  cantidadRecibida: number | null;
  producto: { codigo: string; nombre: string };
}

export interface Transferencia {
  id: string;
  numero: string;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  estado: EstadoTransferencia;
  usuarioEnviaId: string;
  usuarioRecibeId: string | null;
  fechaEnvio: string | null;
  fechaRecepcion: string | null;
  observacion: string | null;
  createdAt: string;
  sucursalOrigen: { nombre: string };
  sucursalDestino: { nombre: string };
  usuarioEnvia: { nombres: string; apellidos: string };
  usuarioRecibe: { nombres: string; apellidos: string } | null;
  detalles: TransferenciaDetalle[];
}

export interface CreateTransferenciaItem {
  productoId: string;
  cantidad: number;
}

export interface CreateTransferencia {
  sucursalDestinoId: string;
  observacion?: string;
  items: CreateTransferenciaItem[];
}
