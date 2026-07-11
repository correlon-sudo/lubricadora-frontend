import { TipoComprobante, TipoItemVenta, VentaItem } from '../venta.model';

export type EstadoCotizacion = 'VIGENTE' | 'CONVERTIDA' | 'ANULADA' | 'VENCIDA';

export interface CotizacionDetalle {
  id: string;
  tipoItem: TipoItemVenta;
  productoId: string | null;
  servicioId: string | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  ivaPorcentaje: number;
  subtotal: number;
}

export interface Cotizacion {
  id: string;
  numero: string;
  sucursalId: string;
  clienteId: string | null;
  vehiculoId: string | null;
  usuarioId: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  estado: EstadoCotizacion;
  validezDias: number;
  fecha: string;
  detalles: CotizacionDetalle[];
  cliente: { nombres: string; apellidos: string | null } | null;
  usuario: { nombres: string; apellidos: string };
}

export interface CreateCotizacion {
  clienteId?: string;
  vehiculoId?: string;
  validezDias?: number;
  items: VentaItem[];
}

export interface ConvertirCotizacion {
  tipoComprobante: TipoComprobante;
  pagos: { formaPago: string; monto: number; referencia?: string }[];
}
