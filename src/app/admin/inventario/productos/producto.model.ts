export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  marcaId: string;
  categoriaId: string;
  // Ausente en la respuesta cuando el rol es VENDEDOR (solo consulta, sin
  // margen de ganancia visible — ver matriz de permisos).
  precioCosto?: number;
  precioVenta: number;
  stockMinimo: number;
  ivaAplicable: boolean;
  activo: boolean;
  marca: { id: string; nombre: string };
  categoria: { id: string; nombre: string };
  stockTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProducto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  marcaId: string;
  categoriaId: string;
  precioCosto: number;
  precioVenta: number;
  stockMinimo?: number;
  ivaAplicable?: boolean;
}

export type UpdateProducto = Partial<CreateProducto>;

export interface ProductoStockBajo {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  sucursalId: string;
  sucursalNombre: string;
  cantidad: number;
  minimo: number;
}

export interface FindProductosFiltros {
  marcaId?: string;
  categoriaId?: string;
  sucursalId?: string;
  search?: string;
}
