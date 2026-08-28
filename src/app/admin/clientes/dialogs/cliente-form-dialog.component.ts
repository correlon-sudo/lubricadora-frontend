import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';
import { Cliente, TipoIdentificacion } from '../cliente.model';
import { ClientesService } from '../clientes.service';

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
        @if (posiblesDuplicados().length > 0) {
          <div class="alert alert-warning py-2 px-3 mb-3">
            Ya existe{{ posiblesDuplicados().length > 1 ? 'n' : '' }} cliente{{
              posiblesDuplicados().length > 1 ? 's' : ''
            }}
            con el mismo nombre:
            <ul class="mb-0 ps-3">
              @for (dup of posiblesDuplicados(); track dup.id) {
                <li>
                  {{ dup.nombres }} {{ dup.apellidos }} — {{ dup.identificacion }}
                  @if (dup.telefono) {
                    ({{ dup.telefono }})
                  }
                </li>
              }
            </ul>
            Revisá que no sea la misma persona antes de guardar.
          </div>
        }
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
  private clientesService = inject(ClientesService);

  tipos = TIPOS;
  posiblesDuplicados = signal<Cliente[]>([]);

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

  constructor() {
    combineLatest([
      this.form.controls.nombres.valueChanges.pipe(
        startWith(this.form.controls.nombres.value),
      ),
      this.form.controls.apellidos.valueChanges.pipe(
        startWith(this.form.controls.apellidos.value),
      ),
    ])
      .pipe(
        debounceTime(400),
        distinctUntilChanged(
          ([n1, a1], [n2, a2]) => n1 === n2 && a1 === a2,
        ),
        switchMap(([nombres]) => {
          // El backend hace OR de "contains" por campo (no concatena
          // nombres+apellidos), asi que se busca solo por nombres y el
          // match exacto de apellidos se filtra en el subscribe de abajo.
          const term = (nombres ?? '').trim();
          if (!term) return [[]];
          return this.clientesService.findAll(term);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((clientes) => {
        const nombres = this.form.controls.nombres.value?.trim().toLowerCase() ?? '';
        const apellidos = this.form.controls.apellidos.value?.trim().toLowerCase() ?? '';
        this.posiblesDuplicados.set(
          clientes.filter(
            (c) =>
              c.id !== this.data.cliente?.id &&
              c.nombres.trim().toLowerCase() === nombres &&
              (c.apellidos ?? '').trim().toLowerCase() === apellidos,
          ),
        );
      });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
