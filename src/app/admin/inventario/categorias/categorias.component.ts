import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { ConfirmDialogComponent } from '@shared';
import { CategoriasService } from './categorias.service';
import { Categoria } from './categoria.model';
import {
  CategoriaFormDialogComponent,
  CategoriaFormDialogData,
} from './dialogs/categoria-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-categorias',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Categorías'"
            [items]="['Inventario']"
            [active_item]="'Categorías'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <app-master-table
              [title]="'Categorías'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'categorias'"
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
export class CategoriasComponent implements OnInit {
  private categoriasService = inject(CategoriasService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  columnDefinitions: ColumnDefinition[] = [
    { def: 'nombre', label: 'Nombre', type: 'text' },
    { def: 'descripcion', label: 'Descripción', type: 'text' },
    { def: 'actions', label: 'Acciones', type: 'actionBtn' },
  ];

  dataSource = new MatTableDataSource<Categoria>([]);
  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.categoriasService.findAll().subscribe({
      next: (categorias) => {
        this.dataSource.data = categorias;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onAdd() {
    this.openForm();
  }

  onEdit(row: Categoria) {
    this.openForm(row);
  }

  openForm(categoria?: Categoria) {
    const ref = this.dialog.open<
      CategoriaFormDialogComponent,
      CategoriaFormDialogData
    >(CategoriaFormDialogComponent, {
      width: '40vw',
      maxWidth: '100vw',
      data: { categoria },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;

      const request = categoria
        ? this.categoriasService.update(categoria.id, value)
        : this.categoriasService.create(value);

      request.subscribe({
        next: () => {
          this.notify(categoria ? 'Categoría actualizada' : 'Categoría creada');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al guardar', true),
      });
    });
  }

  onDelete(row: Categoria) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar categoría',
        message: `¿Eliminar "${row.nombre}"?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.categoriasService.remove(row.id).subscribe({
        next: () => {
          this.notify('Categoría eliminada');
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
