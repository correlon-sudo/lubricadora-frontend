import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { ConfirmDialogComponent } from '@shared';
import { ClientesService } from './clientes.service';
import { Cliente } from './cliente.model';
import {
  ClienteFormDialogComponent,
  ClienteFormDialogData,
} from './dialogs/cliente-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-clientes',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Clientes'"
            [items]="['Clientes']"
            [active_item]="'Clientes'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <app-master-table
              [title]="'Clientes'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'clientes'"
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
export class ClientesComponent implements OnInit {
  private clientesService = inject(ClientesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnDefinitions: ColumnDefinition[] = [
    { def: 'identificacion', label: 'Identificación', type: 'text' },
    { def: 'nombres', label: 'Nombres', type: 'text' },
    { def: 'apellidos', label: 'Apellidos', type: 'text' },
    { def: 'telefono', label: 'Teléfono', type: 'phone' },
    { def: 'email', label: 'Email', type: 'email' },
    { def: 'actions', label: 'Acciones', type: 'actionBtn' },
  ];

  dataSource = new MatTableDataSource<Cliente>([]);
  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.clientesService.findAll().subscribe({
      next: (clientes) => {
        this.dataSource.data = clientes;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onAdd() {
    this.openForm();
  }

  onEdit(row: Cliente) {
    this.openForm(row);
  }

  openForm(cliente?: Cliente) {
    const ref = this.dialog.open<
      ClienteFormDialogComponent,
      ClienteFormDialogData
    >(ClienteFormDialogComponent, {
      width: '55vw',
      maxWidth: '100vw',
      data: { cliente },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;

      const request = cliente
        ? this.clientesService.update(cliente.id, value)
        : this.clientesService.create(value);

      request.subscribe({
        next: () => {
          this.notify(cliente ? 'Cliente actualizado' : 'Cliente creado');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al guardar', true),
      });
    });
  }

  onDelete(row: Cliente) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar cliente',
        message: `¿Desactivar a ${row.nombres} ${row.apellidos ?? ''}?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.clientesService.remove(row.id).subscribe({
        next: () => {
          this.notify('Cliente desactivado');
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
