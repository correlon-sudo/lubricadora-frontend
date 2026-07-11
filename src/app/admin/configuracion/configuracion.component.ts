import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ConfiguracionService } from './configuracion.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent,
  ],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Configuración'"
            [items]="['Administración']"
            [active_item]="'Configuración'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-8">
            <div class="card">
              <div class="body">
                @if (isLoading) {
                  <mat-spinner diameter="32"></mat-spinner>
                } @else {
                  <form [formGroup]="form" (ngSubmit)="onSubmit()">
                    <div class="row">
                      <mat-form-field class="col-6" appearance="outline">
                        <mat-label>RUC</mat-label>
                        <input matInput formControlName="ruc" maxlength="13" />
                      </mat-form-field>
                      <mat-form-field class="col-6" appearance="outline">
                        <mat-label>Moneda</mat-label>
                        <input matInput formControlName="moneda" />
                      </mat-form-field>
                    </div>
                    <div class="row">
                      <mat-form-field class="col-6" appearance="outline">
                        <mat-label>Razón social</mat-label>
                        <input matInput formControlName="razonSocial" />
                      </mat-form-field>
                      <mat-form-field class="col-6" appearance="outline">
                        <mat-label>Nombre comercial</mat-label>
                        <input matInput formControlName="nombreComercial" />
                      </mat-form-field>
                    </div>
                    <div class="row">
                      <mat-form-field class="col-6" appearance="outline">
                        <mat-label>Dirección</mat-label>
                        <input matInput formControlName="direccion" />
                      </mat-form-field>
                      <mat-form-field class="col-6" appearance="outline">
                        <mat-label>Teléfono</mat-label>
                        <input matInput formControlName="telefono" />
                      </mat-form-field>
                    </div>
                    <div class="row">
                      <mat-form-field class="col-6" appearance="outline">
                        <mat-label>IVA (%)</mat-label>
                        <input
                          matInput
                          type="number"
                          step="0.01"
                          formControlName="porcentajeIva"
                        />
                      </mat-form-field>
                    </div>
                    <button
                      mat-flat-button
                      color="primary"
                      type="submit"
                      [disabled]="form.invalid || isSaving"
                    >
                      Guardar
                    </button>
                  </form>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ConfiguracionComponent implements OnInit {
  private configuracionService = inject(ConfiguracionService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  isSaving = false;

  form = this.fb.nonNullable.group({
    ruc: [''],
    razonSocial: [''],
    nombreComercial: [''],
    direccion: [''],
    telefono: [''],
    porcentajeIva: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
    moneda: ['USD', Validators.required],
  });

  ngOnInit() {
    this.configuracionService.get().subscribe({
      next: (config) => {
        this.form.patchValue({
          ruc: config.ruc ?? '',
          razonSocial: config.razonSocial ?? '',
          nombreComercial: config.nombreComercial ?? '',
          direccion: config.direccion ?? '',
          telefono: config.telefono ?? '',
          porcentajeIva: config.porcentajeIva,
          moneda: config.moneda,
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isSaving = true;
    this.configuracionService.update(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
        this.snackBar.open('Configuración guardada', 'Cerrar', {
          duration: 3000,
          panelClass: 'snackbar-success',
        });
      },
      error: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
        this.snackBar.open('Error al guardar', 'Cerrar', {
          duration: 3000,
          panelClass: 'snackbar-danger',
        });
      },
    });
  }
}
