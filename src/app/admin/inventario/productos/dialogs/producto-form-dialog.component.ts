import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Categoria } from '../../categorias/categoria.model';
import { Marca } from '../../marcas/marca.model';
import { Producto } from '../producto.model';

export interface ProductoFormDialogData {
  producto?: Producto;
  marcas: Marca[];
  categorias: Categoria[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-producto-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.producto ? 'Editar producto' : 'Nuevo producto' }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Código</mat-label>
            <input matInput formControlName="codigo" />
          </mat-form-field>
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" />
          </mat-form-field>
        </div>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Descripción</mat-label>
          <input matInput formControlName="descripcion" />
        </mat-form-field>
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Marca</mat-label>
            <mat-select formControlName="marcaId">
              @for (m of data.marcas; track m.id) {
                <mat-option [value]="m.id">{{ m.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="categoriaId">
              @for (c of data.categorias; track c.id) {
                <mat-option [value]="c.id">{{ c.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field class="col-4" appearance="outline">
            <mat-label>Precio costo</mat-label>
            <input matInput type="number" step="0.01" formControlName="precioCosto" />
          </mat-form-field>
          <mat-form-field class="col-4" appearance="outline">
            <mat-label>Precio venta</mat-label>
            <input matInput type="number" step="0.01" formControlName="precioVenta" />
          </mat-form-field>
          <mat-form-field class="col-4" appearance="outline">
            <mat-label>Stock mínimo</mat-label>
            <input matInput type="number" formControlName="stockMinimo" />
          </mat-form-field>
        </div>
        <mat-checkbox formControlName="ivaAplicable">Aplica IVA</mat-checkbox>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="null">
          Cancelar
        </button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          [disabled]="form.invalid"
        >
          Guardar
        </button>
      </mat-dialog-actions>
    </form>
  `,
})
export class ProductoFormDialogComponent {
  data = inject<ProductoFormDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ProductoFormDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    codigo: [this.data.producto?.codigo ?? '', Validators.required],
    nombre: [this.data.producto?.nombre ?? '', Validators.required],
    descripcion: [this.data.producto?.descripcion ?? ''],
    marcaId: [this.data.producto?.marcaId ?? '', Validators.required],
    categoriaId: [this.data.producto?.categoriaId ?? '', Validators.required],
    precioCosto: [this.data.producto?.precioCosto ?? 0, [Validators.required, Validators.min(0)]],
    precioVenta: [this.data.producto?.precioVenta ?? 0, [Validators.required, Validators.min(0)]],
    stockMinimo: [this.data.producto?.stockMinimo ?? 0, [Validators.min(0)]],
    ivaAplicable: [this.data.producto?.ivaAplicable ?? true],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
