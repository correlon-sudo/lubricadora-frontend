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
import { Cliente, TipoIdentificacion } from '../cliente.model';

export interface ClienteFormDialogData {
  cliente?: Cliente;
}

const TIPOS: TipoIdentificacion[] = ['CEDULA', 'RUC', 'PASAPORTE'];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cliente-form-dialog',
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
      {{ data.cliente ? 'Editar cliente' : 'Nuevo cliente' }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="row">
          <mat-form-field class="col-4" appearance="outline">
            <mat-label>Tipo identificación</mat-label>
            <mat-select formControlName="tipoIdentificacion">
              @for (t of tipos; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field class="col-8" appearance="outline">
            <mat-label>Identificación</mat-label>
            <input matInput formControlName="identificacion" maxlength="20" />
          </mat-form-field>
        </div>
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
        @if (form.value.tipoIdentificacion === 'RUC') {
          <mat-form-field class="w-100" appearance="outline">
            <mat-label>Razón social</mat-label>
            <input matInput formControlName="razonSocial" />
          </mat-form-field>
        }
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono" />
          </mat-form-field>
        </div>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" />
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
export class ClienteFormDialogComponent {
  data = inject<ClienteFormDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ClienteFormDialogComponent>);
  private fb = inject(FormBuilder);

  tipos = TIPOS;

  form = this.fb.nonNullable.group({
    tipoIdentificacion: [
      this.data.cliente?.tipoIdentificacion ?? ('CEDULA' as TipoIdentificacion),
      Validators.required,
    ],
    identificacion: [this.data.cliente?.identificacion ?? '', Validators.required],
    nombres: [this.data.cliente?.nombres ?? '', Validators.required],
    apellidos: [this.data.cliente?.apellidos ?? ''],
    razonSocial: [this.data.cliente?.razonSocial ?? ''],
    email: [this.data.cliente?.email ?? '', Validators.email],
    telefono: [this.data.cliente?.telefono ?? ''],
    direccion: [this.data.cliente?.direccion ?? ''],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
