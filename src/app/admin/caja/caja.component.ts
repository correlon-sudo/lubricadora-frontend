import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { CajaService } from './caja.service';
import { Caja, ReporteDiario } from './caja.model';
import { CerrarCajaDialogComponent } from './dialogs/cerrar-caja-dialog.component';
import { MovimientoCajaDialogComponent } from './dialogs/movimiento-caja-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-caja',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    BreadcrumbComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './caja.component.html',
})
export class CajaComponent implements OnInit {
  private cajaService = inject(CajaService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  cajaActual: Caja | null = null;
  reporte: ReporteDiario | null = null;
  historial: Caja[] = [];
  isLoading = true;

  formAbrir = this.fb.nonNullable.group({
    montoInicial: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.loadActual();
    this.loadHistorial();
  }

  loadActual() {
    this.isLoading = true;
    this.cajaService.actual().subscribe({
      next: (caja) => {
        this.cajaActual = caja;
        this.isLoading = false;
        this.cdr.markForCheck();
        this.cajaService.reporteDiario(caja.id).subscribe((reporte) => {
          this.reporte = reporte;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.cajaActual = null;
        this.reporte = null;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  get totalEfectivoEnVivo(): number {
    if (!this.reporte) return 0;
    let total = 0;
    for (const v of this.reporte.ventas) {
      for (const p of v.pagos) {
        if (p.formaPago === 'EFECTIVO') total += p.monto;
      }
      total -= v.vuelto;
    }
    const ingresos = this.reporte.movimientos
      .filter((m) => m.tipo === 'INGRESO')
      .reduce((s, m) => s + m.monto, 0);
    const egresos = this.reporte.movimientos
      .filter((m) => m.tipo === 'EGRESO')
      .reduce((s, m) => s + m.monto, 0);
    return this.reporte.montoInicial + total + ingresos - egresos;
  }

  get totalVentasEnVivo(): number {
    return this.reporte?.ventas.reduce((s, v) => s + v.total, 0) ?? 0;
  }

  loadHistorial() {
    this.cajaService.historial().subscribe((historial) => {
      this.historial = historial;
      this.cdr.markForCheck();
    });
  }

  onAbrir() {
    if (this.formAbrir.invalid) return;
    this.cajaService.abrir(this.formAbrir.getRawValue()).subscribe({
      next: () => {
        this.notify('Caja abierta');
        this.loadActual();
        this.loadHistorial();
      },
      error: (err) => this.notify(err?.error?.message ?? 'Error al abrir caja', true),
    });
  }

  onNuevoMovimiento() {
    if (!this.cajaActual) return;
    const ref = this.dialog.open(MovimientoCajaDialogComponent, {
      width: '40vw',
      maxWidth: '100vw',
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value || !this.cajaActual) return;
      this.cajaService.movimiento(this.cajaActual.id, value).subscribe({
        next: () => this.notify('Movimiento registrado'),
        error: (err) => this.notify(err?.error?.message ?? 'Error al registrar movimiento', true),
      });
    });
  }

  onCerrar() {
    if (!this.cajaActual) return;
    const ref = this.dialog.open(CerrarCajaDialogComponent, {
      width: '40vw',
      maxWidth: '100vw',
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value || !this.cajaActual) return;
      this.cajaService.cerrar(this.cajaActual.id, value).subscribe({
        next: (caja) => {
          this.notify(
            `Caja cerrada. Diferencia: $${caja.diferencia?.toFixed(2) ?? '0.00'}`,
          );
          this.loadActual();
          this.loadHistorial();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al cerrar caja', true),
      });
    });
  }

  onVerPdf(caja: Caja) {
    this.cajaService.reportePdf(caja.id).subscribe({
      next: (blob) => window.open(URL.createObjectURL(blob), '_blank'),
      error: () => this.notify('Error al generar el PDF', true),
    });
  }

  onVerPdfActual() {
    if (!this.cajaActual) return;
    this.onVerPdf(this.cajaActual);
  }

  private notify(message: string, isError = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'snackbar-danger' : 'snackbar-success',
    });
  }
}
