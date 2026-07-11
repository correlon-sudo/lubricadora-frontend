import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Colaborador, TipoSueldo } from '../colaborador.model';

export interface ColaboradorFormDialogData {
  colaborador?: Colaborador;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-colaborador-form-dialog',
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
      {{ data.colaborador ? 'Editar colaborador' : 'Nuevo colaborador' }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Nombres</mat-label>
            <input matInput formControlName="nombres" />
          </mat-form-field>
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Apellidos</mat-label>
            <input matInput formControlName="apellidos" />
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Cédula</mat-label>
            <input matInput formControlName="cedula" maxlength="13" />
          </mat-form-field>
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Cargo</mat-label>
            <input matInput formControlName="cargo" />
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono" />
          </mat-form-field>
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>
        </div>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" />
        </mat-form-field>
        <div class="row">
          <mat-form-field class="col-4" appearance="outline">
            <mat-label>Tipo de sueldo</mat-label>
            <mat-select formControlName="tipoSueldo">
              @for (t of tipos; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field class="col-4" appearance="outline">
            <mat-label>Monto sueldo</mat-label>
            <input matInput type="number" step="0.01" formControlName="montoSueldo" />
          </mat-form-field>
          <mat-form-field class="col-4" appearance="outline">
            <mat-label>Fecha de ingreso</mat-label>
            <input matInput type="date" formControlName="fechaIngreso" />
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
export class ColaboradorFormDialogComponent {
  data = inject<ColaboradorFormDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ColaboradorFormDialogComponent>);
  private fb = inject(FormBuilder);

  tipos: TipoSueldo[] = ['SEMANAL', 'MENSUAL'];

  form = this.fb.nonNullable.group({
    nombres: [this.data.colaborador?.nombres ?? '', Validators.required],
    apellidos: [this.data.colaborador?.apellidos ?? '', Validators.required],
    cedula: [this.data.colaborador?.cedula ?? '', Validators.required],
    cargo: [this.data.colaborador?.cargo ?? ''],
    telefono: [this.data.colaborador?.telefono ?? ''],
    email: [this.data.colaborador?.email ?? '', Validators.email],
    direccion: [this.data.colaborador?.direccion ?? ''],
    tipoSueldo: [
      this.data.colaborador?.tipoSueldo ?? ('MENSUAL' as TipoSueldo),
      Validators.required,
    ],
    montoSueldo: [
      this.data.colaborador?.montoSueldo ?? 0,
      [Validators.required, Validators.min(0)],
    ],
    fechaIngreso: [
      this.data.colaborador?.fechaIngreso?.substring(0, 10) ??
        new Date().toISOString().substring(0, 10),
      Validators.required,
    ],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
