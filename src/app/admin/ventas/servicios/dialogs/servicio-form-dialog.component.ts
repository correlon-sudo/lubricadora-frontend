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
import { Servicio } from '../servicio.model';

export interface ServicioFormDialogData {
  servicio?: Servicio;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-servicio-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.servicio ? 'Editar servicio' : 'Nuevo servicio' }}
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
        <mat-form-field class="col-6" appearance="outline">
          <mat-label>Precio</mat-label>
          <input matInput type="number" step="0.01" formControlName="precio" />
        </mat-form-field>
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
export class ServicioFormDialogComponent {
  data = inject<ServicioFormDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ServicioFormDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    codigo: [this.data.servicio?.codigo ?? '', Validators.required],
    nombre: [this.data.servicio?.nombre ?? '', Validators.required],
    descripcion: [this.data.servicio?.descripcion ?? ''],
    precio: [this.data.servicio?.precio ?? 0, [Validators.required, Validators.min(0)]],
    ivaAplicable: [this.data.servicio?.ivaAplicable ?? true],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
