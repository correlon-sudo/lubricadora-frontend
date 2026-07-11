import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';
import { AuthGuard } from '@core/guard/auth.guard';
import { Role } from '@core';

export const ADMIN_ROUTE: Route[] = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTE),
  },
  {
    // ADMIN-only dentro de /admin: CRUD usuarios y sucursales no es
    // parte de la matriz de permisos de ENCARGADO.
    path: 'usuarios',
    canActivate: [AuthGuard],
    data: { role: Role.Admin },
    loadComponent: () =>
      import('./usuarios/usuarios.component').then((m) => m.UsuariosComponent),
  },
  {
    path: 'sucursales',
    canActivate: [AuthGuard],
    data: { role: Role.Admin },
    loadComponent: () =>
      import('./sucursales/sucursales.component').then(
        (m) => m.SucursalesComponent,
      ),
  },
  {
    path: 'configuracion',
    canActivate: [AuthGuard],
    data: { role: Role.Admin },
    loadComponent: () =>
      import('./configuracion/configuracion.component').then(
        (m) => m.ConfiguracionComponent,
      ),
  },
  {
    // Fase 9 (endurecimiento): trazabilidad de ventas/transferencias/caja,
    // ADMIN-only (misma restricción que usuarios/sucursales/configuración).
    path: 'auditoria',
    canActivate: [AuthGuard],
    data: { role: Role.Admin },
    loadComponent: () =>
      import('./auditoria/auditoria.component').then((m) => m.AuditoriaComponent),
  },
  {
    // VENDEDOR tiene solo consulta de productos (matriz de permisos), no
    // gestión de categorías/marcas.
    path: 'inventario/categorias',
    canActivate: [AuthGuard],
    data: { role: [Role.Admin, Role.Encargado] },
    loadComponent: () =>
      import('./inventario/categorias/categorias.component').then(
        (m) => m.CategoriasComponent,
      ),
  },
  {
    path: 'inventario/marcas',
    canActivate: [AuthGuard],
    data: { role: [Role.Admin, Role.Encargado] },
    loadComponent: () =>
      import('./inventario/marcas/marcas.component').then(
        (m) => m.MarcasComponent,
      ),
  },
  {
    path: 'inventario/productos',
    loadComponent: () =>
      import('./inventario/productos/productos.component').then(
        (m) => m.ProductosComponent,
      ),
  },
  {
    path: 'inventario/movimientos',
    canActivate: [AuthGuard],
    data: { role: [Role.Admin, Role.Encargado] },
    loadComponent: () =>
      import('./inventario/movimientos/movimientos.component').then(
        (m) => m.MovimientosComponent,
      ),
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./clientes/clientes.component').then((m) => m.ClientesComponent),
  },
  {
    path: 'vehiculos',
    loadComponent: () =>
      import('./vehiculos/vehiculos.component').then((m) => m.VehiculosComponent),
  },
  {
    path: 'ventas',
    loadComponent: () =>
      import('./ventas/ventas.component').then((m) => m.VentasComponent),
  },
  {
    // Anular venta: ADMIN/ENCARGADO sí, VENDEDOR no (matriz de permisos).
    path: 'ventas/historial',
    canActivate: [AuthGuard],
    data: { role: [Role.Admin, Role.Encargado] },
    loadComponent: () =>
      import('./ventas/historial/historial.component').then(
        (m) => m.HistorialVentasComponent,
      ),
  },
  {
    // Catálogo de servicios (gestión), no confundir con el picker de
    // servicios dentro del carrito del POS — eso es una llamada API directa,
    // no navega a esta página.
    path: 'ventas/servicios',
    canActivate: [AuthGuard],
    data: { role: [Role.Admin, Role.Encargado] },
    loadComponent: () =>
      import('./ventas/servicios/servicios.component').then(
        (m) => m.ServiciosComponent,
      ),
  },
  {
    path: 'ventas/cotizaciones',
    loadComponent: () =>
      import('./ventas/cotizaciones/cotizaciones.component').then(
        (m) => m.CotizacionesComponent,
      ),
  },
  {
    path: 'caja',
    loadComponent: () =>
      import('./caja/caja.component').then((m) => m.CajaComponent),
  },
  {
    path: 'inventario/transferencias',
    canActivate: [AuthGuard],
    data: { role: [Role.Admin, Role.Encargado] },
    loadComponent: () =>
      import('./transferencias/transferencias.component').then(
        (m) => m.TransferenciasComponent,
      ),
  },
  {
    path: 'colaboradores',
    canActivate: [AuthGuard],
    data: { role: [Role.Admin, Role.Encargado] },
    loadComponent: () =>
      import('./colaboradores/colaboradores.component').then(
        (m) => m.ColaboradoresComponent,
      ),
  },
  {
    path: 'reportes',
    canActivate: [AuthGuard],
    data: { role: [Role.Admin, Role.Encargado] },
    loadComponent: () =>
      import('./dashboard-reportes/dashboard-reportes.component').then(
        (m) => m.DashboardReportesComponent,
      ),
  },
  { path: '**', component: Page404Component },
];
