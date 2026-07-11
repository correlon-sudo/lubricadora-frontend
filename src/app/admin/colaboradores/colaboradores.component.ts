import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { ConfirmDialogComponent } from '@shared';
import { ColaboradoresService } from './colaboradores.service';
import { Colaborador } from './colaborador.model';
import {
  ColaboradorFormDialogComponent,
  ColaboradorFormDialogData,
} from './dialogs/colaborador-form-dialog.component';
import {
  ColaboradorDetalleDialogComponent,
  ColaboradorDetalleDialogData,
} from './dialogs/colaborador-detalle-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-colaboradores',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Colaboradores'"
            [items]="['RR.HH.']"
            [active_item]="'Colaboradores'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <app-master-table
              [title]="'Colaboradores'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'colaboradores'"
              [showDetails]="true"
              (add)="onAdd()"
              (edit)="onEdit($event)"
              (delete)="onDelete($event)"
              (details)="onDetalle($event)"
              (refresh)="loadData()"
            ></app-master-table>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ColaboradoresComponent implements OnInit {
  private colaboradoresService = inject(ColaboradoresService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnDefinitions: ColumnDefinition[] = [
    { def: 'nombres', label: 'Nombres', type: 'text' },
    { def: 'apellidos', label: 'Apellidos', type: 'text' },
    { def: 'cedula', label: 'Cédula', type: 'text' },
    { def: 'cargo', label: 'Cargo', type: 'text' },
    { def: 'tipoSueldo', label: 'Tipo sueldo', type: 'text' },
    { def: 'montoSueldo', label: 'Sueldo', type: 'number' },
    { def: 'actions', label: 'Acciones', type: 'actionBtn' },
  ];

  dataSource = new MatTableDataSource<Colaborador>([]);
  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.colaboradoresService.findAll().subscribe({
      next: (colaboradores) => {
        this.dataSource.data = colaboradores;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onAdd() {
    this.openForm();
  }

  onEdit(row: Colaborador) {
    this.openForm(row);
  }

  openForm(colaborador?: Colaborador) {
    const ref = this.dialog.open<
      ColaboradorFormDialogComponent,
      ColaboradorFormDialogData
    >(ColaboradorFormDialogComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: { colaborador },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;

      const request = colaborador
        ? this.colaboradoresService.update(colaborador.id, value)
        : this.colaboradoresService.create(value);

      request.subscribe({
        next: () => {
          this.notify(colaborador ? 'Colaborador actualizado' : 'Colaborador creado');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al guardar', true),
      });
    });
  }

  onDetalle(row: Colaborador) {
    this.dialog.open<ColaboradorDetalleDialogComponent, ColaboradorDetalleDialogData>(
      ColaboradorDetalleDialogComponent,
      { width: '55vw', maxWidth: '100vw', data: { colaborador: row }, autoFocus: false },
    );
  }

  onDelete(row: Colaborador) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar colaborador',
        message: `¿Desactivar a ${row.nombres} ${row.apellidos}?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.colaboradoresService.remove(row.id).subscribe({
        next: () => {
          this.notify('Colaborador desactivado');
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
