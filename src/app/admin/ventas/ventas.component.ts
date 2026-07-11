import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ProductosService } from '../inventario/productos/productos.service';
import { ServiciosService } from './servicios/servicios.service';
import { ClientesService } from '../clientes/clientes.service';
import { VehiculosService } from '../vehiculos/vehiculos.service';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { VentasService } from './ventas.service';
import { CotizacionesService } from './cotizaciones/cotizaciones.service';
import { Producto } from '../inventario/productos/producto.model';
import { Servicio } from './servicios/servicio.model';
import { Cliente } from '../clientes/cliente.model';
import { Vehiculo } from '../vehiculos/vehiculo.model';
import { CreateVenta, FormaPago, TipoComprobante, TipoItemVenta } from './venta.model';

interface CartLine {
  tipoItem: TipoItemVenta;
  productoId?: string;
  servicioId?: string;
  descripcion: string;
  precioUnitario: number;
  ivaAplicable: boolean;
  cantidad: number;
  descuento: number;
}

interface PagoLinea {
  formaPago: FormaPago;
  monto: number;
  referencia: string;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ventas',
  standalone: true,
  imports: [
    FormsModule,
    BreadcrumbComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './ventas.component.html',
})
export class VentasComponent implements OnInit {
  private productosService = inject(ProductosService);
  private serviciosService = inject(ServiciosService);
  private clientesService = inject(ClientesService);
  private vehiculosService = inject(VehiculosService);
  private configuracionService = inject(ConfiguracionService);
  private ventasService = inject(VentasService);
  private cotizacionesService = inject(CotizacionesService);
  private snackBar = inject(MatSnackBar);

  productos = signal<Producto[]>([]);
  servicios = signal<Servicio[]>([]);
  clientes = signal<Cliente[]>([]);
  vehiculos = signal<Vehiculo[]>([]);
  porcentajeIva = signal(15);

  modo = signal<'VENTA' | 'COTIZACION'>('VENTA');

  busqueda = signal('');
  cart = signal<CartLine[]>([]);
  pagos = signal<PagoLinea[]>([{ formaPago: 'EFECTIVO', monto: 0, referencia: '' }]);

  clienteId = signal<string | undefined>(undefined);
  vehiculoId = signal<string | undefined>(undefined);
  tipoComprobante = signal<TipoComprobante>('NOTA_VENTA');

  formasPago: FormaPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'];
  tiposComprobante: TipoComprobante[] = [
    'NOTA_VENTA',
    'FACTURA',
    'NOTA_PEDIDO',
    'NOTA_ENTREGA',
  ];

  isSubmitting = false;
  ultimaVentaId: string | null = null;
  ultimaCotizacionId: string | null = null;

  resultadosBusqueda = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return [];

    const prods = this.productos()
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(termino) ||
          p.codigo.toLowerCase().includes(termino),
      )
      .map((p) => ({
        tipoItem: 'PRODUCTO' as TipoItemVenta,
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        precio: p.precioVenta,
        ivaAplicable: p.ivaAplicable,
      }));

    const servs = this.servicios()
      .filter(
        (s) =>
          s.nombre.toLowerCase().includes(termino) ||
          s.codigo.toLowerCase().includes(termino),
      )
      .map((s) => ({
        tipoItem: 'SERVICIO' as TipoItemVenta,
        id: s.id,
        codigo: s.codigo,
        nombre: s.nombre,
        precio: s.precio,
        ivaAplicable: s.ivaAplicable,
      }));

    return [...prods, ...servs].slice(0, 15);
  });

  vehiculosDelCliente = computed(() => {
    const cid = this.clienteId();
    if (!cid) return [];
    return this.vehiculos().filter((v) => v.clienteId === cid);
  });

  totales = computed(() => {
    let subtotal = 0;
    let iva = 0;
    let descuentoTotal = 0;

    for (const linea of this.cart()) {
      const base = round2(linea.precioUnitario * linea.cantidad - linea.descuento);
      subtotal += base;
      descuentoTotal += linea.descuento;
      if (linea.ivaAplicable) {
        iva += round2(base * (this.porcentajeIva() / 100));
      }
    }

    subtotal = round2(subtotal);
    iva = round2(iva);
    const total = round2(subtotal + iva);
    return { subtotal, iva, descuentoTotal: round2(descuentoTotal), total };
  });

  sumaPagos = computed(() =>
    round2(this.pagos().reduce((s, p) => s + (p.monto || 0), 0)),
  );

  pagosCuadran = computed(
    () => Math.abs(this.sumaPagos() - this.totales().total) < 0.01,
  );

  ngOnInit() {
    this.productosService.findAll().subscribe((productos) => this.productos.set(productos));
    this.serviciosService.findAll().subscribe((servicios) => this.servicios.set(servicios));
    this.vehiculosService.findAll().subscribe((vehiculos) => this.vehiculos.set(vehiculos));
    this.configuracionService
      .get()
      .subscribe((config) => this.porcentajeIva.set(config.porcentajeIva));

    this.clientesService.findAll().subscribe((clientes) => {
      this.clientes.set(clientes);
      const consumidorFinal = clientes.find((c) => c.esConsumidorFinal);
      if (consumidorFinal) this.clienteId.set(consumidorFinal.id);
    });
  }

  agregarAlCarrito(item: {
    tipoItem: TipoItemVenta;
    id: string;
    nombre: string;
    precio: number;
    ivaAplicable: boolean;
  }) {
    const esProducto = item.tipoItem === 'PRODUCTO';
    const existente = this.cart().find(
      (l) =>
        l.tipoItem === item.tipoItem &&
        (esProducto ? l.productoId === item.id : l.servicioId === item.id),
    );

    if (existente) {
      this.cart.update((lineas) =>
        lineas.map((l) =>
          l === existente ? { ...l, cantidad: l.cantidad + 1 } : l,
        ),
      );
    } else {
      const nuevaLinea: CartLine = {
        tipoItem: item.tipoItem,
        productoId: esProducto ? item.id : undefined,
        servicioId: esProducto ? undefined : item.id,
        descripcion: item.nombre,
        precioUnitario: item.precio,
        ivaAplicable: item.ivaAplicable,
        cantidad: 1,
        descuento: 0,
      };
      this.cart.update((lineas) => [...lineas, nuevaLinea]);
    }

    this.busqueda.set('');
  }

  actualizarCantidad(index: number, cantidad: number) {
    this.cart.update((lineas) =>
      lineas.map((l, i) => (i === index ? { ...l, cantidad: Math.max(1, cantidad) } : l)),
    );
  }

  actualizarDescuento(index: number, descuento: number) {
    this.cart.update((lineas) =>
      lineas.map((l, i) => (i === index ? { ...l, descuento: Math.max(0, descuento) } : l)),
    );
  }

  quitarLinea(index: number) {
    this.cart.update((lineas) => lineas.filter((_, i) => i !== index));
  }

  agregarPago() {
    this.pagos.update((p) => [...p, { formaPago: 'EFECTIVO', monto: 0, referencia: '' }]);
  }

  quitarPago(index: number) {
    this.pagos.update((p) => p.filter((_, i) => i !== index));
  }

  actualizarPago(index: number, campo: keyof PagoLinea, valor: string | number) {
    this.pagos.update((p) =>
      p.map((pago, i) => (i === index ? { ...pago, [campo]: valor } : pago)),
    );
  }

  onClienteChange(clienteId: string) {
    this.clienteId.set(clienteId);
    this.vehiculoId.set(undefined);
  }

  confirmar() {
    if (this.cart().length === 0) {
      this.notify('Agregá al menos un ítem al carrito', true);
      return;
    }

    if (this.modo() === 'COTIZACION') {
      this.guardarCotizacion();
      return;
    }

    if (!this.pagosCuadran()) {
      this.notify('La suma de pagos no coincide con el total', true);
      return;
    }

    const dto: CreateVenta = {
      tipoComprobante: this.tipoComprobante(),
      clienteId: this.clienteId(),
      vehiculoId: this.vehiculoId(),
      items: this.cart().map((l) => ({
        tipoItem: l.tipoItem,
        productoId: l.productoId,
        servicioId: l.servicioId,
        cantidad: l.cantidad,
        descuento: l.descuento || undefined,
      })),
      pagos: this.pagos().map((p) => ({
        formaPago: p.formaPago,
        monto: p.monto,
        referencia: p.referencia || undefined,
      })),
    };

    this.isSubmitting = true;
    this.ventasService.create(dto).subscribe({
      next: (venta) => {
        this.isSubmitting = false;
        this.ultimaVentaId = venta.id;
        this.notify(`Venta ${venta.numero} registrada`);
        this.resetCarrito();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notify(err?.error?.message ?? 'Error al registrar la venta', true);
      },
    });
  }

  private guardarCotizacion() {
    this.isSubmitting = true;
    this.cotizacionesService
      .create({
        clienteId: this.clienteId(),
        vehiculoId: this.vehiculoId(),
        items: this.cart().map((l) => ({
          tipoItem: l.tipoItem,
          productoId: l.productoId,
          servicioId: l.servicioId,
          cantidad: l.cantidad,
          descuento: l.descuento || undefined,
        })),
      })
      .subscribe({
        next: (cotizacion) => {
          this.isSubmitting = false;
          this.ultimaCotizacionId = cotizacion.id;
          this.notify(`Cotización ${cotizacion.numero} guardada`);
          this.resetCarrito();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.notify(err?.error?.message ?? 'Error al guardar la cotización', true);
        },
      });
  }

  verPdf(ventaId: string | null) {
    if (!ventaId) return;
    this.ventasService.reportePdf(ventaId).subscribe({
      next: (blob) => window.open(URL.createObjectURL(blob), '_blank'),
      error: () => this.notify('Error al generar el PDF', true),
    });
  }

  verPdfCotizacion(cotizacionId: string | null) {
    if (!cotizacionId) return;
    this.cotizacionesService.reportePdf(cotizacionId).subscribe({
      next: (blob) => window.open(URL.createObjectURL(blob), '_blank'),
      error: () => this.notify('Error al generar el PDF', true),
    });
  }

  private resetCarrito() {
    this.cart.set([]);
    this.pagos.set([{ formaPago: 'EFECTIVO', monto: 0, referencia: '' }]);
  }

  private notify(message: string, isError = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'snackbar-danger' : 'snackbar-success',
    });
  }
}
