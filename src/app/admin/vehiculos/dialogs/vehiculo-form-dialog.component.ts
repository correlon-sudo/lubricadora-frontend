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
import { Cliente } from '../../clientes/cliente.model';
import { Vehiculo } from '../vehiculo.model';

export interface VehiculoFormDialogData {
  vehiculo?: Vehiculo;
  clientes: Cliente[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vehiculo-form-dialog',
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
    <h2 mat-dialog-title>
      {{ data.vehiculo ? 'Editar vehículo' : 'Nuevo vehículo' }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Cliente (dueño)</mat-label>
          <mat-select formControlName="clienteId">
            @for (c of data.clientes; track c.id) {
              <mat-option [value]="c.id">
                {{ c.nombres }} {{ c.apellidos }} — {{ c.identificacion }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Placa</mat-label>
            <input matInput formControlName="placa" maxlength="10" />
          </mat-form-field>
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Año</mat-label>
            <input matInput type="number" formControlName="anio" />
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Marca</mat-label>
            <input matInput formControlName="marca" />
          </mat-form-field>
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Modelo</mat-label>
            <input matInput formControlName="modelo" />
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Color</mat-label>
            <input matInput formControlName="color" />
          </mat-form-field>
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Kilometraje</mat-label>
            <input matInput type="number" formControlName="kilometraje" />
          </mat-form-field>
        </div>
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
export class VehiculoFormDialogComponent {
  data = inject<VehiculoFormDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<VehiculoFormDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    clienteId: [this.data.vehiculo?.clienteId ?? '', Validators.required],
    placa: [this.data.vehiculo?.placa ?? '', Validators.required],
    marca: [this.data.vehiculo?.marca ?? '', Validators.required],
    modelo: [this.data.vehiculo?.modelo ?? '', Validators.required],
    anio: [this.data.vehiculo?.anio ?? null],
    color: [this.data.vehiculo?.color ?? ''],
    kilometraje: [this.data.vehiculo?.kilometraje ?? null],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
