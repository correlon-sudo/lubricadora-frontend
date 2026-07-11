import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AuthService, Role } from '@core';
import { ReportesService } from './reportes.service';
import {
  Consolidado,
  DashboardResumen,
  ProductoMasVendido,
  ReporteVentas,
} from './reporte.model';

function hoy(): string {
  return new Date().toISOString().substring(0, 10);
}

function inicioDeMes(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().substring(0, 10);
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-reportes',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    BreadcrumbComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './dashboard-reportes.component.html',
})
export class DashboardReportesComponent implements OnInit {
  private reportesService = inject(ReportesService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // /reportes/consolidado es ADMIN-only en backend (agregado cross-sucursal);
  // ENCARGADO no lo puede ver, ni tiene sentido pedirlo (403).
  esAdmin = this.authService.currentUser().roles?.[0]?.name === Role.Admin;

  resumen: DashboardResumen | null = null;

  desde = inicioDeMes();
  hasta = hoy();

  reporteVentas: ReporteVentas | null = null;
  productosMasVendidos: ProductoMasVendido[] = [];
  consolidado: Consolidado | null = null;

  ngOnInit() {
    this.reportesService.resumen().subscribe((r) => {
      this.resumen = r;
      this.cdr.markForCheck();
    });
    this.onBuscar();
  }

  onBuscar() {
    this.reportesService.reporteVentas(this.desde, this.hasta).subscribe((r) => {
      this.reporteVentas = r;
      this.cdr.markForCheck();
    });
    this.reportesService.productosMasVendidos(this.desde, this.hasta).subscribe((r) => {
      this.productosMasVendidos = r;
      this.cdr.markForCheck();
    });
    if (this.esAdmin) {
      this.reportesService.consolidado(this.desde, this.hasta).subscribe((r) => {
        this.consolidado = r;
        this.cdr.markForCheck();
      });
    }
  }
}
