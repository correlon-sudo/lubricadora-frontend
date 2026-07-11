import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface CerrarCajaDialogData {
  montoEsperadoEstimado?: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cerrar-caja-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Cerrar caja</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <p>Contá el efectivo físico en el cajón e ingresá el monto.</p>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Monto contado</mat-label>
          <input matInput type="number" step="0.01" formControlName="montoContado" />
        </mat-form-field>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Observación (opcional)</mat-label>
          <input matInput formControlName="observacion" />
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="null">Cancelar</button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          [disabled]="form.invalid"
        >
          Cerrar caja
        </button>
      </mat-dialog-actions>
    </form>
  `,
})
export class CerrarCajaDialogComponent {
  data = inject<CerrarCajaDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<CerrarCajaDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    montoContado: [0, [Validators.required, Validators.min(0)]],
    observacion: [''],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
