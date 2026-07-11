export type TipoItemVenta = 'PRODUCTO' | 'SERVICIO';
export type TipoComprobante = 'FACTURA' | 'NOTA_VENTA' | 'NOTA_PEDIDO' | 'NOTA_ENTREGA';
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';
export type EstadoVenta = 'EMITIDA' | 'ANULADA';

export interface VentaItem {
  tipoItem: TipoItemVenta;
  productoId?: string;
  servicioId?: string;
  cantidad: number;
  descuento?: number;
}

export interface Pago {
  formaPago: FormaPago;
  monto: number;
  referencia?: string;
}

export interface CreateVenta {
  tipoComprobante: TipoComprobante;
  clienteId?: string;
  vehiculoId?: string;
  items: VentaItem[];
  pagos: Pago[];
}

export interface VentaDetalle {
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

export interface Venta {
  id: string;
  numero: string;
  tipoComprobante: TipoComprobante;
  sucursalId: string;
  clienteId: string | null;
  vehiculoId: string | null;
  usuarioId: string;
  subtotal: number;
  descuentoTotal: number;
  iva: number;
  total: number;
  estado: EstadoVenta;
  fecha: string;
  detalles: VentaDetalle[];
  pagos: (Pago & { id: string })[];
  cliente: { nombres: string; apellidos: string | null; identificacion: string } | null;
  vehiculo: { placa: string; marca: string; modelo: string } | null;
  usuario: { nombres: string; apellidos: string };
}
