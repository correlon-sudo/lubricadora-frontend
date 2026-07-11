import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehiculosService } from '../vehiculos.service';
import { VehiculoConHistorial } from '../vehiculo.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-buscar-placa-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Buscar por placa</h2>
    <mat-dialog-content>
      <form [formGroup]="form" (ngSubmit)="onBuscar()" class="row">
        <mat-form-field class="col-8" appearance="outline">
          <mat-label>Placa</mat-label>
          <input matInput formControlName="placa" />
        </mat-form-field>
        <div class="col-4">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
            Buscar
          </button>
        </div>
      </form>

      @if (isLoading()) {
        <mat-spinner diameter="32"></mat-spinner>
      }

      @if (noEncontrado()) {
        <p>No se encontró un vehículo con esa placa.</p>
      }

      @if (resultado(); as vehiculo) {
        <div class="modern-card">
          <h4>{{ vehiculo.placa }} — {{ vehiculo.marca }} {{ vehiculo.modelo }}</h4>
          <p>Año: {{ vehiculo.anio ?? '—' }} · Color: {{ vehiculo.color ?? '—' }} · Km: {{ vehiculo.kilometraje ?? '—' }}</p>
          <hr />
          <p><strong>Dueño:</strong> {{ vehiculo.cliente.nombres }} {{ vehiculo.cliente.apellidos }}</p>
          <p><strong>Identificación:</strong> {{ vehiculo.cliente.identificacion }}</p>
          <p><strong>Teléfono:</strong> {{ vehiculo.cliente.telefono ?? '—' }}</p>
          <hr />
          <p><strong>Historial de servicios:</strong> aún no disponible (módulo de ventas pendiente).</p>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cerrar</button>
    </mat-dialog-actions>
  `,
})
export class BuscarPlacaDialogComponent {
  private vehiculosService = inject(VehiculosService);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    placa: ['', Validators.required],
  });

  isLoading = signal(false);
  resultado = signal<VehiculoConHistorial | null>(null);
  noEncontrado = signal(false);

  onBuscar() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.resultado.set(null);
    this.noEncontrado.set(false);

    this.vehiculosService.findByPlaca(this.form.getRawValue().placa).subscribe({
      next: (vehiculo) => {
        this.resultado.set(vehiculo);
        this.isLoading.set(false);
      },
      error: () => {
        this.noEncontrado.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
