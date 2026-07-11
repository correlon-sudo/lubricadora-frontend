import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { ConfirmDialogComponent } from '@shared';
import { ServiciosService } from './servicios.service';
import { Servicio } from './servicio.model';
import {
  ServicioFormDialogComponent,
  ServicioFormDialogData,
} from './dialogs/servicio-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-servicios',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Servicios'"
            [items]="['Ventas']"
            [active_item]="'Servicios'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <app-master-table
              [title]="'Servicios'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'servicios'"
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
export class ServiciosComponent implements OnInit {
  private serviciosService = inject(ServiciosService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnDefinitions: ColumnDefinition[] = [
    { def: 'codigo', label: 'Código', type: 'text' },
    { def: 'nombre', label: 'Nombre', type: 'text' },
    { def: 'precio', label: 'Precio', type: 'number' },
    { def: 'actions', label: 'Acciones', type: 'actionBtn' },
  ];

  dataSource = new MatTableDataSource<Servicio>([]);
  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.serviciosService.findAll().subscribe({
      next: (servicios) => {
        this.dataSource.data = servicios;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onAdd() {
    this.openForm();
  }

  onEdit(row: Servicio) {
    this.openForm(row);
  }

  openForm(servicio?: Servicio) {
    const ref = this.dialog.open<
      ServicioFormDialogComponent,
      ServicioFormDialogData
    >(ServicioFormDialogComponent, {
      width: '50vw',
      maxWidth: '100vw',
      data: { servicio },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;

      const request = servicio
        ? this.serviciosService.update(servicio.id, value)
        : this.serviciosService.create(value);

      request.subscribe({
        next: () => {
          this.notify(servicio ? 'Servicio actualizado' : 'Servicio creado');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al guardar', true),
      });
    });
  }

  onDelete(row: Servicio) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar servicio',
        message: `¿Desactivar "${row.nombre}"?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.serviciosService.remove(row.id).subscribe({
        next: () => {
          this.notify('Servicio desactivado');
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
