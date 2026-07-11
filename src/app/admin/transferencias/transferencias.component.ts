import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '@shared';
import { TransferenciasService } from './transferencias.service';
import { ProductosService } from '../inventario/productos/productos.service';
import { SucursalesService } from '../sucursales/sucursales.service';
import { Transferencia } from './transferencia.model';
import { Producto } from '../inventario/productos/producto.model';
import { Sucursal } from '../sucursales/sucursal.model';
import {
  TransferenciaFormDialogComponent,
  TransferenciaFormDialogData,
} from './dialogs/transferencia-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-transferencias',
  standalone: true,
  imports: [BreadcrumbComponent, MatButtonModule, DatePipe],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Transferencias'"
            [items]="['Inventario']"
            [active_item]="'Transferencias'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="modern-card body">
              <button mat-flat-button color="primary" class="mb-2" (click)="onNueva()">
                + Nueva transferencia
              </button>
              <table class="table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of transferencias; track t.id) {
                    <tr>
                      <td>{{ t.numero }}</td>
                      <td>{{ t.sucursalOrigen.nombre }}</td>
                      <td>{{ t.sucursalDestino.nombre }}</td>
                      <td>{{ t.estado }}</td>
                      <td>{{ t.createdAt | date: 'short' }}</td>
                      <td class="text-end">
                        <button mat-stroked-button (click)="onVerPdf(t)">PDF</button>
                        @if (t.estado === 'PENDIENTE') {
                          <button mat-flat-button color="primary" (click)="onEnviar(t)">
                            Enviar
                          </button>
                          <button mat-stroked-button color="warn" (click)="onAnular(t)">
                            Anular
                          </button>
                        }
                        @if (t.estado === 'EN_TRANSITO') {
                          <button mat-flat-button color="primary" (click)="onRecibir(t)">
                            Recibir
                          </button>
                          <button mat-stroked-button color="warn" (click)="onAnular(t)">
                            Anular
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center text-muted">
                        No hay transferencias registradas.
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
export class TransferenciasComponent implements OnInit {
  private transferenciasService = inject(TransferenciasService);
  private productosService = inject(ProductosService);
  private sucursalesService = inject(SucursalesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  transferencias: Transferencia[] = [];
  private productos: Producto[] = [];
  private sucursales: Sucursal[] = [];

  ngOnInit() {
    this.productosService.findAll().subscribe((productos) => (this.productos = productos));
    this.sucursalesService.findAll().subscribe((sucursales) => (this.sucursales = sucursales));
    this.loadData();
  }

  loadData() {
    this.transferenciasService.findAll().subscribe((transferencias) => {
      this.transferencias = transferencias;
      this.cdr.markForCheck();
    });
  }

  onNueva() {
    const sucursalOrigenId = this.sucursales[0]?.id ?? '';
    const ref = this.dialog.open<
      TransferenciaFormDialogComponent,
      TransferenciaFormDialogData
    >(TransferenciaFormDialogComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: { productos: this.productos, sucursales: this.sucursales, sucursalOrigenId },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((value) => {
      if (!value) return;
      this.transferenciasService.create(value).subscribe({
        next: (t) => {
          this.notify(`Transferencia ${t.numero} creada`);
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al crear', true),
      });
    });
  }

  onEnviar(t: Transferencia) {
    this.transferenciasService.enviar(t.id).subscribe({
      next: () => {
        this.notify('Transferencia enviada');
        this.loadData();
      },
      error: (err) => this.notify(err?.error?.message ?? 'Error al enviar', true),
    });
  }

  onRecibir(t: Transferencia) {
    this.transferenciasService.recibir(t.id).subscribe({
      next: () => {
        this.notify('Transferencia recibida');
        this.loadData();
      },
      error: (err) => this.notify(err?.error?.message ?? 'Error al recibir', true),
    });
  }

  onAnular(t: Transferencia) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Anular transferencia',
        message: `¿Anular la transferencia ${t.numero}?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.transferenciasService.anular(t.id).subscribe({
        next: () => {
          this.notify('Transferencia anulada');
          this.loadData();
        },
        error: (err) => this.notify(err?.error?.message ?? 'Error al anular', true),
      });
    });
  }

  onVerPdf(t: Transferencia) {
    this.transferenciasService.reportePdf(t.id).subscribe({
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
