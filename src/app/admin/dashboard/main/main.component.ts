import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ReportesService } from '../../dashboard-reportes/reportes.service';
import { DashboardResumen } from '../../dashboard-reportes/reporte.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [BreadcrumbComponent, RouterLink],
})
export class MainComponent implements OnInit {
  private reportesService = inject(ReportesService);
  private cdr = inject(ChangeDetectorRef);

  resumen: DashboardResumen | null = null;

  breadscrums = [
    {
      title: 'Dashboard',
      items: [],
      active: 'Resumen',
    },
  ];

  ngOnInit() {
    this.reportesService.resumen().subscribe((r) => {
      this.resumen = r;
      this.cdr.markForCheck();
    });
  }
}
