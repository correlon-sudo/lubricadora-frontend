import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { ConfirmDialogComponent } from '@shared';
import { MarcasService } from './marcas.service';
import { Marca } from './marca.model';
import {
  MarcaFormDialogComponent,
  MarcaFormDialogData,
} from './dialogs/marca-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-marcas',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Marcas'"
            [items]="['Inventario']"
            [active_item]="'Marcas'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <app-master-table
              [title]="'Marcas'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'marcas'"
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
export class MarcasComponent implements OnInit {
  private marcasService = inject(MarcasService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnDefinitions: ColumnDefinition[] = [
    { def: 'nombre', label: 'Nombre', type: 'text' },
    { def: 'actions', label: 'Acciones', type: 'actionBtn' },
  ];

  dataSource = new MatTableDataSource<Marca>([]);
  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.marcasService.findAll().subscribe({
      next: (marcas) => {
        this.dataSource.data = marcas;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onAdd() {
    this.openForm();
  }

  onEdit(row: Marca) {
    this.openForm(row);
  }

  openForm(marca?: Marca) {
    const ref = this.dialog.open<MarcaFormDialogComponent, MarcaFormDialogData>(
      MarcaFormDialogComponent,
      {
        width: '40vw',
        maxWidth: '100vw',
        data: { marca },
        autoFocus: false,
      },
    );

    ref.afterClosed().subscribe((value) => {
      if (!value) return;

      const request = marca
        ? this.marcasService.update(marca.id, value)
        : this.marcasService.create(value);

      request.subscribe({
        next: () => {
          this.notify(marca ? 'Marca actualizada' : 'Marca creada');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al guardar', true),
      });
    });
  }

  onDelete(row: Marca) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar marca',
        message: `¿Eliminar "${row.nombre}"?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.marcasService.remove(row.id).subscribe({
        next: () => {
          this.notify('Marca eliminada');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al eliminar', true),
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
