export interface DashboardResumen {
  ventasHoy: { cantidad: number; total: number };
  cajaAbierta: boolean;
  montoInicialCaja: number | null;
  stockBajoCount: number;
  transferenciasPendientes: number;
}

export interface VentaReporte {
  id: string;
  numero: string;
  fecha: string;
  cliente: string | null;
  vendedor: string;
  sucursal: string;
  subtotal: number;
  iva: number;
  total: number;
}

export interface ReporteVentas {
  ventas: VentaReporte[];
  totales: { cantidad: number; subtotal: number; iva: number; total: number };
}

export interface ProductoMasVendido {
  producto: { id: string; codigo: string; nombre: string } | null;
  cantidadVendida: number;
  totalVendido: number;
}

export interface ConsolidadoSucursal {
  sucursalId: string;
  sucursalNombre: string;
  cantidadVentas: number;
  subtotal: number;
  iva: number;
  total: number;
}

export interface Consolidado {
  porSucursal: ConsolidadoSucursal[];
  totalGeneral: { cantidadVentas: number; subtotal: number; iva: number; total: number };
}
