import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { ConfirmDialogComponent } from '@shared';
import { SucursalesService } from './sucursales.service';
import { Sucursal } from './sucursal.model';
import {
  SucursalFormDialogComponent,
  SucursalFormDialogData,
} from './dialogs/sucursal-form-dialog.component';

interface SucursalRow extends Sucursal {
  esMatrizLabel: string;
  estadoLabel: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-sucursales',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Sucursales'"
            [items]="['Administración']"
            [active_item]="'Sucursales'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <app-master-table
              [title]="'Sucursales'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'sucursales'"
              [showDetails]="false"
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
export class SucursalesComponent implements OnInit {
  private sucursalesService = inject(SucursalesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnDefinitions: ColumnDefinition[] = [
    { def: 'nombre', label: 'Nombre', type: 'text' },
    { def: 'direccion', label: 'Dirección', type: 'address' },
    { def: 'telefono', label: 'Teléfono', type: 'phone' },
    { def: 'esMatrizLabel', label: 'Matriz', type: 'text' },
    {
      def: 'estadoLabel',
      label: 'Estado',
      type: 'status',
      statusBadgeMap: {
        Activo: 'badge badge-solid-green',
        Inactivo: 'badge badge-solid-red',
      },
    },
    { def: 'actions', label: 'Acciones', type: 'actionBtn' },
  ];

  dataSource = new MatTableDataSource<SucursalRow>([]);
  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.sucursalesService.findAll().subscribe({
      next: (sucursales) => {
        this.dataSource.data = sucursales.map((s) => ({
          ...s,
          esMatrizLabel: s.esMatriz ? 'Sí' : 'No',
          estadoLabel: s.activo ? 'Activo' : 'Inactivo',
        }));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onAdd() {
    this.openForm();
  }

  onEdit(row: SucursalRow) {
    this.openForm(row);
  }

  openForm(sucursal?: Sucursal) {
    const ref = this.dialog.open<
      SucursalFormDialogComponent,
      SucursalFormDialogData
    >(SucursalFormDialogComponent, {
      width: '50vw',
      maxWidth: '100vw',
      data: { sucursal },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;

      const request = sucursal
        ? this.sucursalesService.update(sucursal.id, value)
        : this.sucursalesService.create(value);

      request.subscribe({
        next: () => {
          this.notify(sucursal ? 'Sucursal actualizada' : 'Sucursal creada');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al guardar', true),
      });
    });
  }

  onDelete(row: SucursalRow) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar sucursal',
        message: `¿Desactivar "${row.nombre}"?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.sucursalesService.remove(row.id).subscribe({
        next: () => {
          this.notify('Sucursal desactivada');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al desactivar', true),
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
