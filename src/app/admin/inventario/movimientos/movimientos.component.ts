import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { InventarioService } from './inventario.service';
import { ProductosService } from '../productos/productos.service';
import { SucursalesService } from '../../sucursales/sucursales.service';
import { MovimientoInventario } from './movimiento.model';
import { Producto } from '../productos/producto.model';
import { Sucursal } from '../../sucursales/sucursal.model';
import {
  AjusteFormDialogComponent,
  AjusteFormDialogData,
} from './dialogs/ajuste-form-dialog.component';

interface MovimientoRow extends MovimientoInventario {
  productoLabel: string;
  sucursalNombre: string;
  usuarioNombre: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-movimientos',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Kardex'"
            [items]="['Inventario']"
            [active_item]="'Movimientos'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <app-master-table
              [title]="'Movimientos de inventario'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'kardex'"
              [showCheckbox]="false"
              [showEdit]="false"
              [showDelete]="false"
              [showDetails]="false"
              [showBulkDelete]="false"
              [enableRowClick]="false"
              (add)="onNuevoAjuste()"
              (refresh)="loadData()"
            ></app-master-table>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class MovimientosComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private productosService = inject(ProductosService);
  private sucursalesService = inject(SucursalesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnDefinitions: ColumnDefinition[] = [
    { def: 'fecha', label: 'Fecha', type: 'date' },
    { def: 'productoLabel', label: 'Producto', type: 'text' },
    { def: 'sucursalNombre', label: 'Sucursal', type: 'text' },
    { def: 'tipo', label: 'Tipo', type: 'text' },
    { def: 'cantidad', label: 'Cantidad', type: 'number' },
    { def: 'stockResultante', label: 'Stock resultante', type: 'number' },
    { def: 'usuarioNombre', label: 'Usuario', type: 'text' },
  ];

  dataSource = new MatTableDataSource<MovimientoRow>([]);
  isLoading = true;
  private productos: Producto[] = [];
  private sucursales: Sucursal[] = [];

  ngOnInit() {
    this.productosService.findAll().subscribe((productos) => (this.productos = productos));
    this.sucursalesService.findAll().subscribe((sucursales) => (this.sucursales = sucursales));
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.inventarioService.movimientos({ limit: 100 }).subscribe({
      next: (pagina) => {
        this.dataSource.data = pagina.items.map((m) => ({
          ...m,
          productoLabel: `${m.producto.codigo} — ${m.producto.nombre}`,
          sucursalNombre: m.sucursal.nombre,
          usuarioNombre: `${m.usuario.nombres} ${m.usuario.apellidos}`,
        }));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onNuevoAjuste() {
    const ref = this.dialog.open<AjusteFormDialogComponent, AjusteFormDialogData>(
      AjusteFormDialogComponent,
      {
        width: '45vw',
        maxWidth: '100vw',
        data: { productos: this.productos, sucursales: this.sucursales },
        autoFocus: false,
      },
    );

    ref.afterClosed().subscribe((value) => {
      if (!value) return;

      this.inventarioService.ajustar(value).subscribe({
        next: () => {
          this.notify('Ajuste registrado');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al ajustar', true),
      });
    });
  }

  private notify(message: string, isError = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'snackbar-danger' : 'snackbar-success',
    });
  }
}
