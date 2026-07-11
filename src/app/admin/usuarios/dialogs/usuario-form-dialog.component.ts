import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Sucursal } from '../../sucursales/sucursal.model';
import { RolUsuario, Usuario } from '../usuario.model';

export interface UsuarioFormDialogData {
  usuario?: Usuario;
  sucursales: Sucursal[];
}

const ROLES: RolUsuario[] = ['ADMIN', 'ENCARGADO', 'VENDEDOR'];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-usuario-form-dialog',
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
      {{ data.usuario ? 'Editar usuario' : 'Nuevo usuario' }}
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
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Usuario</mat-label>
            <input matInput formControlName="username" />
          </mat-form-field>
          @if (!data.usuario) {
            <mat-form-field class="col-6" appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>
          }
        </div>
        <div class="row">
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Sucursal</mat-label>
            <mat-select formControlName="sucursalId">
              @for (s of data.sucursales; track s.id) {
                <mat-option [value]="s.id">{{ s.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field class="col-6" appearance="outline">
            <mat-label>Rol</mat-label>
            <mat-select formControlName="rol">
              @for (r of roles; track r) {
                <mat-option [value]="r">{{ r }}</mat-option>
              }
            </mat-select>
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
export class UsuarioFormDialogComponent {
  data = inject<UsuarioFormDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<UsuarioFormDialogComponent>);
  private fb = inject(FormBuilder);

  roles = ROLES;

  form = this.fb.nonNullable.group({
    nombres: [this.data.usuario?.nombres ?? '', Validators.required],
    apellidos: [this.data.usuario?.apellidos ?? '', Validators.required],
    cedula: [this.data.usuario?.cedula ?? '', Validators.required],
    email: [
      this.data.usuario?.email ?? '',
      [Validators.required, Validators.email],
    ],
    username: [this.data.usuario?.username ?? '', Validators.required],
    password: [
      '',
      this.data.usuario ? [] : [Validators.required, Validators.minLength(6)],
    ],
    sucursalId: [this.data.usuario?.sucursalId ?? '', Validators.required],
    rol: [this.data.usuario?.rol ?? ('VENDEDOR' as RolUsuario), Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
