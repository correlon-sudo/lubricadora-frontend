import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Producto } from '../../productos/producto.model';
import { Sucursal } from '../../../sucursales/sucursal.model';

export interface AjusteFormDialogData {
  productos: Producto[];
  sucursales: Sucursal[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ajuste-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Ajuste de stock</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Producto</mat-label>
          <mat-select formControlName="productoId">
            @for (p of data.productos; track p.id) {
              <mat-option [value]="p.id">{{ p.codigo }} — {{ p.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Sucursal</mat-label>
          <mat-select formControlName="sucursalId">
            @for (s of data.sucursales; track s.id) {
              <mat-option [value]="s.id">{{ s.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Cantidad (+ entrada / − salida)</mat-label>
          <input matInput type="number" formControlName="cantidad" />
        </mat-form-field>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Observación</mat-label>
          <input matInput formControlName="observacion" />
        </mat-form-field>
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
export class AjusteFormDialogComponent {
  data = inject<AjusteFormDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<AjusteFormDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    productoId: ['', Validators.required],
    sucursalId: ['', Validators.required],
    cantidad: [0, [Validators.required, this.noCero]],
    observacion: [''],
  });

  private noCero(control: { value: number }) {
    return control.value === 0 ? { noCero: true } : null;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
