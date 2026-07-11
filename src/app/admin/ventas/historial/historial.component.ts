import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '@shared';
import { VentasService } from '../ventas.service';
import { Venta } from '../venta.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [BreadcrumbComponent, MatButtonModule, DatePipe, DecimalPipe],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Historial de ventas'"
            [items]="['Ventas']"
            [active_item]="'Historial'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="modern-card body">
              <table class="table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Vendedor</th>
                    <th class="text-end">Total</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (v of ventas; track v.id) {
                    <tr>
                      <td>{{ v.numero }}</td>
                      <td>{{ v.fecha | date: 'short' }}</td>
                      <td>{{ v.cliente ? v.cliente.nombres + ' ' + (v.cliente.apellidos ?? '') : '—' }}</td>
                      <td>{{ v.usuario.nombres }} {{ v.usuario.apellidos }}</td>
                      <td class="text-end">&#36;{{ v.total | number: '1.2-2' }}</td>
                      <td>{{ v.estado }}</td>
                      <td class="text-end">
                        <button mat-stroked-button (click)="onVerPdf(v)">PDF</button>
                        @if (v.estado === 'EMITIDA') {
                          <button mat-stroked-button color="warn" (click)="onAnular(v)">
                            Anular
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted">
                        No hay ventas registradas.
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
export class HistorialVentasComponent implements OnInit {
  private ventasService = inject(VentasService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  ventas: Venta[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.ventasService.findAll().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.cdr.markForCheck();
      },
      error: (err) => this.notify(err?.error?.message ?? 'Error al cargar ventas', true),
    });
  }

  onAnular(v: Venta) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Anular venta',
        message: `¿Anular la venta ${v.numero}? Esto revierte el stock descontado.`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.ventasService.anular(v.id).subscribe({
        next: () => {
          this.notify('Venta anulada');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al anular', true),
      });
    });
  }

  onVerPdf(v: Venta) {
    this.ventasService.reportePdf(v.id).subscribe({
      next: (blob) => window.open(URL.createObjectURL(blob), '_blank'),
      error: () => this.notify('Error al generar el PDF', true),
    });
  }

  private notify(message: string, isError = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'snackbar-danger' : 'snackbar-success',
    });
  }
}
