import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { CotizacionesService } from './cotizaciones.service';
import { Cotizacion } from './cotizacion.model';
import {
  ConvertirDialogComponent,
  ConvertirDialogData,
} from './dialogs/convertir-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [BreadcrumbComponent, MatButtonModule, DatePipe],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Cotizaciones'"
            [items]="['Ventas']"
            [active_item]="'Cotizaciones'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="modern-card body">
              <table class="table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of cotizaciones; track c.id) {
                    <tr>
                      <td>{{ c.numero }}</td>
                      <td>
                        {{ c.cliente ? (c.cliente.nombres + ' ' + (c.cliente.apellidos ?? '')) : 'Consumidor Final' }}
                      </td>
                      <td>{{ c.fecha | date: 'short' }}</td>
                      <td>&#36;{{ c.total.toFixed(2) }}</td>
                      <td>{{ c.estado }}</td>
                      <td class="text-end">
                        <button mat-stroked-button (click)="onVerPdf(c)">PDF</button>
                        @if (c.estado === 'VIGENTE') {
                          <button mat-flat-button color="primary" (click)="onConvertir(c)">
                            Convertir
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center text-muted">
                        No hay cotizaciones registradas.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class CotizacionesComponent implements OnInit {
  private cotizacionesService = inject(CotizacionesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  cotizaciones: Cotizacion[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.cotizacionesService.findAll().subscribe((cotizaciones) => {
      this.cotizaciones = cotizaciones;
      this.cdr.markForCheck();
    });
  }

  onVerPdf(row: Cotizacion) {
    this.cotizacionesService.reportePdf(row.id).subscribe({
      next: (blob) => window.open(URL.createObjectURL(blob), '_blank'),
      error: () => this.notify('Error al generar el PDF', true),
    });
  }

  onConvertir(row: Cotizacion) {
    const ref = this.dialog.open<ConvertirDialogComponent, ConvertirDialogData>(
      ConvertirDialogComponent,
      { width: '45vw', maxWidth: '100vw', data: { cotizacion: row }, autoFocus: false },
    );

    ref.afterClosed().subscribe((value) => {
      if (!value) return;
      this.cotizacionesService.convertir(row.id, value).subscribe({
        next: (venta) => {
          this.notify(`Convertida a venta ${venta.numero}`);
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al convertir', true),
      });
    });
  }

  private notify(message: string, isError = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'snackbar-danger' : 'snackbar-success',
    });
  }
}
