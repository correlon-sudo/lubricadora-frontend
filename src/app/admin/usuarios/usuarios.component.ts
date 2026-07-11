import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { ConfirmDialogComponent } from '@shared';
import { UsuariosService } from './usuarios.service';
import { SucursalesService } from '../sucursales/sucursales.service';
import { Usuario } from './usuario.model';
import { Sucursal } from '../sucursales/sucursal.model';
import {
  UsuarioFormDialogComponent,
  UsuarioFormDialogData,
} from './dialogs/usuario-form-dialog.component';

interface UsuarioRow extends Usuario {
  sucursalNombre: string;
  estadoLabel: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-usuarios',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Usuarios'"
            [items]="['Administración']"
            [active_item]="'Usuarios'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <app-master-table
              [title]="'Usuarios'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'usuarios'"
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
export class UsuariosComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private sucursalesService = inject(SucursalesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnDefinitions: ColumnDefinition[] = [
    { def: 'nombres', label: 'Nombres', type: 'text' },
    { def: 'apellidos', label: 'Apellidos', type: 'text' },
    { def: 'username', label: 'Usuario', type: 'text' },
    { def: 'email', label: 'Email', type: 'email' },
    { def: 'rol', label: 'Rol', type: 'text' },
    { def: 'sucursalNombre', label: 'Sucursal', type: 'text' },
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

  dataSource = new MatTableDataSource<UsuarioRow>([]);
  isLoading = true;
  private sucursales: Sucursal[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.sucursalesService.findAll().subscribe({
      next: (sucursales) => {
        this.sucursales = sucursales;
        this.usuariosService.findAll().subscribe({
          next: (usuarios) => {
            this.dataSource.data = usuarios.map((u) => this.toRow(u));
            this.isLoading = false;
          },
          error: () => (this.isLoading = false),
        });
      },
      error: () => (this.isLoading = false),
    });
  }

  private toRow(usuario: Usuario): UsuarioRow {
    const sucursal = this.sucursales.find((s) => s.id === usuario.sucursalId);
    return {
      ...usuario,
      sucursalNombre: sucursal?.nombre ?? '—',
      estadoLabel: usuario.activo ? 'Activo' : 'Inactivo',
    };
  }

  onAdd() {
    this.openForm();
  }

  onEdit(row: UsuarioRow) {
    this.openForm(row);
  }

  openForm(usuario?: Usuario) {
    const ref = this.dialog.open<
      UsuarioFormDialogComponent,
      UsuarioFormDialogData
    >(UsuarioFormDialogComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: { usuario, sucursales: this.sucursales },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;

      const request = usuario
        ? this.usuariosService.update(usuario.id, value)
        : this.usuariosService.create(value);

      request.subscribe({
        next: () => {
          this.notify(usuario ? 'Usuario actualizado' : 'Usuario creado');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al guardar', true),
      });
    });
  }

  onDelete(row: UsuarioRow) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar usuario',
        message: `¿Desactivar a ${row.nombres} ${row.apellidos}?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.usuariosService.remove(row.id).subscribe({
        next: () => {
          this.notify('Usuario desactivado');
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
