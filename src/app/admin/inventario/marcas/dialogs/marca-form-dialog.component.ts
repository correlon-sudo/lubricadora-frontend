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
import { Marca } from '../marca.model';

export interface MarcaFormDialogData {
  marca?: Marca;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-marca-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.marca ? 'Editar marca' : 'Nueva marca' }}</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" />
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
export class MarcaFormDialogComponent {
  data = inject<MarcaFormDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<MarcaFormDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    nombre: [this.data.marca?.nombre ?? '', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
