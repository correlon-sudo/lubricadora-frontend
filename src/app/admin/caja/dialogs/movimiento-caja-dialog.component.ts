import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TipoMovimientoCaja } from '../caja.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-movimiento-caja-dialog',
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
    <h2 mat-dialog-title>Movimiento de caja</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipo">
            <mat-option value="INGRESO">Ingreso</mat-option>
            <mat-option value="EGRESO">Egreso</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Monto</mat-label>
          <input matInput type="number" step="0.01" formControlName="monto" />
        </mat-form-field>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Concepto</mat-label>
          <input matInput formControlName="concepto" />
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="null">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
          Guardar
        </button>
      </mat-dialog-actions>
    </form>
  `,
})
export class MovimientoCajaDialogComponent {
  dialogRef = inject(MatDialogRef<MovimientoCajaDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    tipo: ['INGRESO' as TipoMovimientoCaja, Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    concepto: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
