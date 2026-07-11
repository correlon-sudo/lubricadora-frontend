import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { ColaboradoresService } from '../colaboradores.service';
import { Adelanto, Asistencia, Colaborador, EstadoAsistencia, Nomina } from '../colaborador.model';

export interface ColaboradorDetalleDialogData {
  colaborador: Colaborador;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-colaborador-detalle-dialog',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.colaborador.nombres }} {{ data.colaborador.apellidos }}</h2>
    <mat-dialog-content>
      <h5>Foto</h5>
      @if (fotoUrl()) {
        <img [src]="fotoUrl()" style="max-width:120px; display:block; margin-bottom:8px;" />
      }
      <input type="file" accept="image/*" (change)="onFotoSeleccionada($event)" />

      <hr />

      <h5>Adelantos de sueldo</h5>
      <div class="row mb-2">
        <div class="col-5">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Monto</mat-label>
            <input matInput type="number" step="0.01" [(ngModel)]="nuevoAdelantoMonto" />
          </mat-form-field>
        </div>
        <div class="col-5">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Motivo</mat-label>
            <input matInput [(ngModel)]="nuevoAdelantoMotivo" />
          </mat-form-field>
        </div>
        <div class="col-2 d-flex align-items-center">
          <button mat-stroked-button type="button" (click)="onAgregarAdelanto()">+</button>
        </div>
      </div>
      <table class="table">
        <thead><tr><th>Fecha</th><th>Monto</th><th>Motivo</th></tr></thead>
        <tbody>
          @for (a of adelantos(); track a.id) {
            <tr>
              <td>{{ a.fecha | date: 'shortDate' }}</td>
              <td>&#36;{{ a.monto.toFixed(2) }}</td>
              <td>{{ a.motivo ?? '—' }}</td>
            </tr>
          } @empty {
            <tr><td colspan="3" class="text-muted">Sin adelantos.</td></tr>
          }
        </tbody>
      </table>

      <hr />

      <h5>Asistencia</h5>
      <div class="row mb-2">
        <div class="col-4">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Fecha</mat-label>
            <input matInput type="date" [(ngModel)]="nuevaAsistenciaFecha" />
          </mat-form-field>
        </div>
        <div class="col-4">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="nuevaAsistenciaEstado">
              @for (e of estadosAsistencia; track e) {
                <mat-option [value]="e">{{ e }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <div class="col-4 d-flex align-items-center">
          <button mat-stroked-button type="button" (click)="onRegistrarAsistencia()">
            Registrar
          </button>
        </div>
      </div>
      <table class="table">
        <thead><tr><th>Fecha</th><th>Estado</th></tr></thead>
        <tbody>
          @for (a of asistencias(); track a.id) {
            <tr>
              <td>{{ a.fecha | date: 'shortDate' }}</td>
              <td>{{ a.estado }}</td>
            </tr>
          } @empty {
            <tr><td colspan="2" class="text-muted">Sin registros.</td></tr>
          }
        </tbody>
      </table>

      <hr />

      <h5>Nómina</h5>
      <div class="row mb-2">
        <div class="col-4">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Desde</mat-label>
            <input matInput type="date" [(ngModel)]="periodoInicio" />
          </mat-form-field>
        </div>
        <div class="col-4">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Hasta</mat-label>
            <input matInput type="date" [(ngModel)]="periodoFin" />
          </mat-form-field>
        </div>
        <div class="col-4 d-flex align-items-center">
          <button mat-stroked-button type="button" (click)="onGenerarNomina()">
            Generar
          </button>
        </div>
      </div>

      @if (nomina(); as n) {
        <div class="modern-card body">
          <div class="d-flex justify-content-between"><span>Sueldo base</span><span>&#36;{{ n.sueldoBase.toFixed(2) }}</span></div>
          <div class="d-flex justify-content-between"><span>Adelantos</span><span>&#36;{{ n.totalAdelantos.toFixed(2) }}</span></div>
          <div class="d-flex justify-content-between"><span>Descuentos</span><span>&#36;{{ n.totalDescuentos.toFixed(2) }}</span></div>
          <div class="d-flex justify-content-between"><strong>Neto a pagar</strong><strong>&#36;{{ n.netoPagar.toFixed(2) }}</strong></div>
          <div class="mt-2">Estado: {{ n.estado }}</div>
          @if (n.estado === 'PENDIENTE') {
            <button mat-flat-button color="primary" class="mt-2" (click)="onMarcarPagada(n)">
              Marcar como pagada
            </button>
          }
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cerrar</button>
    </mat-dialog-actions>
  `,
})
export class ColaboradorDetalleDialogComponent implements OnInit {
  data = inject<ColaboradorDetalleDialogData>(MAT_DIALOG_DATA);
  private colaboradoresService = inject(ColaboradoresService);
  private snackBar = inject(MatSnackBar);

  fotoUrl = signal<string | null>(this.resolverFotoUrl(this.data.colaborador.fotoUrl));
  adelantos = signal<Adelanto[]>([]);
  asistencias = signal<Asistencia[]>([]);
  nomina = signal<Nomina | null>(null);

  nuevoAdelantoMonto = 0;
  nuevoAdelantoMotivo = '';

  estadosAsistencia: EstadoAsistencia[] = ['PRESENTE', 'FALTA', 'PERMISO', 'MEDIO_DIA'];
  nuevaAsistenciaFecha = new Date().toISOString().substring(0, 10);
  nuevaAsistenciaEstado: EstadoAsistencia = 'PRESENTE';

  periodoInicio = '';
  periodoFin = '';

  ngOnInit() {
    this.colaboradoresService.findAdelantos(this.data.colaborador.id).subscribe((a) => this.adelantos.set(a));
    this.colaboradoresService.findAsistencias(this.data.colaborador.id).subscribe((a) => this.asistencias.set(a));
  }

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.colaboradoresService.subirFoto(this.data.colaborador.id, file).subscribe({
      next: (colaborador) => {
        this.fotoUrl.set(this.resolverFotoUrl(colaborador.fotoUrl));
        this.notify('Foto actualizada');
      },
      error: (err) => this.notify(err?.error?.message ?? 'Error al subir la foto', true),
    });
  }

  private resolverFotoUrl(fotoUrl: string | null): string | null {
    if (!fotoUrl) return null;
    // Cloudinary devuelve URL absoluta; las fotos viejas (disco local, pre-Cloudinary)
    // quedaron como ruta relativa servida por el backend.
    return /^https?:\/\//.test(fotoUrl) ? fotoUrl : `${environment.apiUrl.replace('/api/v1', '')}${fotoUrl}`;
  }

  onAgregarAdelanto() {
    if (this.nuevoAdelantoMonto <= 0) return;
    this.colaboradoresService
      .crearAdelanto(this.data.colaborador.id, {
        monto: this.nuevoAdelantoMonto,
        motivo: this.nuevoAdelantoMotivo || undefined,
      })
      .subscribe({
        next: () => {
          this.notify('Adelanto registrado');
          this.nuevoAdelantoMonto = 0;
          this.nuevoAdelantoMotivo = '';
          this.colaboradoresService
            .findAdelantos(this.data.colaborador.id)
            .subscribe((a) => this.adelantos.set(a));
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al registrar', true),
      });
  }

  onRegistrarAsistencia() {
    this.colaboradoresService
      .crearAsistencia(this.data.colaborador.id, {
        fecha: this.nuevaAsistenciaFecha,
        estado: this.nuevaAsistenciaEstado,
      })
      .subscribe({
        next: () => {
          this.notify('Asistencia registrada');
          this.colaboradoresService
            .findAsistencias(this.data.colaborador.id)
            .subscribe((a) => this.asistencias.set(a));
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al registrar', true),
      });
  }

  onGenerarNomina() {
    if (!this.periodoInicio || !this.periodoFin) {
      this.notify('Elegí el período', true);
      return;
    }
    this.colaboradoresService
      .nomina(this.data.colaborador.id, this.periodoInicio, this.periodoFin)
      .subscribe({
        next: (n) => this.nomina.set(n),
        error: (err) => this.notify(err?.error?.message ?? 'Error al generar la nómina', true),
      });
  }

  onMarcarPagada(n: Nomina) {
    this.colaboradoresService.marcarNominaPagada(n.id).subscribe({
      next: (actualizada) => {
        this.nomina.set(actualizada);
        this.notify('Nómina marcada como pagada');
      },
      error: (err) => this.notify(err?.error?.message ?? 'Error al marcar como pagada', true),
    });
  }

  private notify(message: string, isError = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'snackbar-danger' : 'snackbar-success',
    });
  }
}
