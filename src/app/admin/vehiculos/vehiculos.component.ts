import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { ConfirmDialogComponent } from '@shared';
import { VehiculosService } from './vehiculos.service';
import { ClientesService } from '../clientes/clientes.service';
import { Vehiculo } from './vehiculo.model';
import { Cliente } from '../clientes/cliente.model';
import {
  VehiculoFormDialogComponent,
  VehiculoFormDialogData,
} from './dialogs/vehiculo-form-dialog.component';
import { BuscarPlacaDialogComponent } from './dialogs/buscar-placa-dialog.component';

interface VehiculoRow extends Vehiculo {
  duenoNombre: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vehiculos',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent, MatButtonModule],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Vehículos'"
            [items]="['Clientes']"
            [active_item]="'Vehículos'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="mb-2">
              <button mat-stroked-button color="primary" (click)="onBuscarPlaca()">
                Buscar por placa
              </button>
            </div>
            <app-master-table
              [title]="'Vehículos'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'vehiculos'"
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
export class VehiculosComponent implements OnInit {
  private vehiculosService = inject(VehiculosService);
  private clientesService = inject(ClientesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnDefinitions: ColumnDefinition[] = [
    { def: 'placa', label: 'Placa', type: 'text' },
    { def: 'marca', label: 'Marca', type: 'text' },
    { def: 'modelo', label: 'Modelo', type: 'text' },
    { def: 'anio', label: 'Año', type: 'text' },
    { def: 'duenoNombre', label: 'Dueño', type: 'text' },
    { def: 'actions', label: 'Acciones', type: 'actionBtn' },
  ];

  dataSource = new MatTableDataSource<VehiculoRow>([]);
  isLoading = true;
  private clientes: Cliente[] = [];

  ngOnInit() {
    this.clientesService.findAll().subscribe((clientes) => (this.clientes = clientes));
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.vehiculosService.findAll().subscribe({
      next: (vehiculos) => {
        this.dataSource.data = vehiculos.map((v) => ({
          ...v,
          duenoNombre: `${v.cliente.nombres} ${v.cliente.apellidos ?? ''}`.trim(),
        }));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onAdd() {
    this.openForm();
  }

  onEdit(row: VehiculoRow) {
    this.openForm(row);
  }

  openForm(vehiculo?: Vehiculo) {
    const ref = this.dialog.open<
      VehiculoFormDialogComponent,
      VehiculoFormDialogData
    >(VehiculoFormDialogComponent, {
      width: '55vw',
      maxWidth: '100vw',
      data: { vehiculo, clientes: this.clientes },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;

      const request = vehiculo
        ? this.vehiculosService.update(vehiculo.id, value)
        : this.vehiculosService.create(value);

      request.subscribe({
        next: () => {
          this.notify(vehiculo ? 'Vehículo actualizado' : 'Vehículo creado');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al guardar', true),
      });
    });
  }

  onDelete(row: VehiculoRow) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar vehículo',
        message: `¿Desactivar la placa "${row.placa}"?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.vehiculosService.remove(row.id).subscribe({
        next: () => {
          this.notify('Vehículo desactivado');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al desactivar', true),
      });
    });
  }

  onBuscarPlaca() {
    this.dialog.open(BuscarPlacaDialogComponent, {
      width: '50vw',
      maxWidth: '100vw',
      autoFocus: false,
    });
  }

  private notify(message: string, isError = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'snackbar-danger' : 'snackbar-success',
    });
  }
}
