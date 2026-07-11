import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { ConfirmDialogComponent } from '@shared';
import { AuthService, Role } from '@core';
import { ProductosService } from './productos.service';
import { MarcasService } from '../marcas/marcas.service';
import { CategoriasService } from '../categorias/categorias.service';
import { Producto } from './producto.model';
import { Marca } from '../marcas/marca.model';
import { Categoria } from '../categorias/categoria.model';
import {
  ProductoFormDialogComponent,
  ProductoFormDialogData,
} from './dialogs/producto-form-dialog.component';

interface ProductoRow extends Producto {
  marcaNombre: string;
  categoriaNombre: string;
  stockLabel: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-productos',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent, MatButtonModule, MatIconModule],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Productos'"
            [items]="['Inventario']"
            [active_item]="'Productos'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="mb-2">
              <button mat-stroked-button color="primary" (click)="onExportarPdf()">
                Exportar PDF
              </button>
            </div>
            <app-master-table
              [title]="'Productos'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'productos'"
              [showDetails]="false"
              [showAdd]="!esVendedor"
              [showEdit]="!esVendedor"
              [showDelete]="!esVendedor"
              (add)="onAdd()"
              (edit)="onEdit($event)"
              (delete)="onDelete($event)"
              (refresh)="loadData()"
            ></app-master-table>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ProductosComponent implements OnInit {
  private productosService = inject(ProductosService);
  private marcasService = inject(MarcasService);
  private categoriasService = inject(CategoriasService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // VENDEDOR tiene solo consulta de productos (matriz de permisos), no CRUD.
  esVendedor = this.authService.currentUser().roles?.[0]?.name === Role.Vendedor;

  columnDefinitions: ColumnDefinition[] = [
    { def: 'codigo', label: 'Código', type: 'text' },
    { def: 'nombre', label: 'Nombre', type: 'text' },
    { def: 'marcaNombre', label: 'Marca', type: 'text' },
    { def: 'categoriaNombre', label: 'Categoría', type: 'text' },
    { def: 'precioVenta', label: 'Precio venta', type: 'number' },
    {
      def: 'stockLabel',
      label: 'Stock',
      type: 'status',
      statusBadgeMap: {
        Bajo: 'badge badge-solid-red',
        OK: 'badge badge-solid-green',
      },
    },
    { def: 'actions', label: 'Acciones', type: 'actionBtn' },
  ];

  dataSource = new MatTableDataSource<ProductoRow>([]);
  isLoading = true;
  private marcas: Marca[] = [];
  private categorias: Categoria[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.marcasService.findAll().subscribe((marcas) => (this.marcas = marcas));
    this.categoriasService
      .findAll()
      .subscribe((categorias) => (this.categorias = categorias));

    this.productosService.findAll().subscribe({
      next: (productos) => {
        this.dataSource.data = productos.map((p) => this.toRow(p));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  private toRow(producto: Producto): ProductoRow {
    return {
      ...producto,
      marcaNombre: producto.marca.nombre,
      categoriaNombre: producto.categoria.nombre,
      stockLabel: producto.stockTotal < producto.stockMinimo ? 'Bajo' : 'OK',
    };
  }

  onAdd() {
    this.openForm();
  }

  onEdit(row: ProductoRow) {
    this.openForm(row);
  }

  openForm(producto?: Producto) {
    const ref = this.dialog.open<
      ProductoFormDialogComponent,
      ProductoFormDialogData
    >(ProductoFormDialogComponent, {
      width: '65vw',
      maxWidth: '100vw',
      data: { producto, marcas: this.marcas, categorias: this.categorias },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;

      const request = producto
        ? this.productosService.update(producto.id, value)
        : this.productosService.create(value);

      request.subscribe({
        next: () => {
          this.notify(producto ? 'Producto actualizado' : 'Producto creado');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al guardar', true),
      });
    });
  }

  onDelete(row: ProductoRow) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar producto',
        message: `¿Desactivar "${row.nombre}"?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.productosService.remove(row.id).subscribe({
        next: () => {
          this.notify('Producto desactivado');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al desactivar', true),
      });
    });
  }

  onExportarPdf() {
    this.productosService.reportePdf().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.notify('Error al generar el PDF', true),
    });
  }

  private notify(message: string, isError = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'snackbar-danger' : 'snackbar-success',
    });
  }
}
