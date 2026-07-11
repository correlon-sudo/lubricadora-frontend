import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MasterTableComponent, ColumnDefinition } from '@shared/components/master-table/master-table.component';
import { AuditoriaService } from './auditoria.service';
import { RegistroAuditoria } from './auditoria.model';

interface AuditoriaRow extends RegistroAuditoria {
  usuarioNombre: string;
  detalleTexto: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-auditoria',
  standalone: true,
  imports: [BreadcrumbComponent, MasterTableComponent],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            [title]="'Auditoría'"
            [items]="['Administración']"
            [active_item]="'Auditoría'"
          ></app-breadcrumb>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <app-master-table
              [title]="'Registro de auditoría'"
              [columnDefinitions]="columnDefinitions"
              [dataSource]="dataSource"
              [isLoading]="isLoading"
              [exportFileName]="'auditoria'"
              [showCheckbox]="false"
              [showAdd]="false"
              [showEdit]="false"
              [showDelete]="false"
              [showDetails]="false"
              [showBulkDelete]="false"
              [enableRowClick]="false"
              (refresh)="loadData()"
            ></app-master-table>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AuditoriaComponent implements OnInit {
  private auditoriaService = inject(AuditoriaService);

  columnDefinitions: ColumnDefinition[] = [
    { def: 'fecha', label: 'Fecha', type: 'date' },
    { def: 'usuarioNombre', label: 'Usuario', type: 'text' },
    { def: 'accion', label: 'Acción', type: 'text' },
    { def: 'entidad', label: 'Entidad', type: 'text' },
    { def: 'detalleTexto', label: 'Detalle', type: 'text' },
    { def: 'ip', label: 'IP', type: 'text' },
  ];

  dataSource = new MatTableDataSource<AuditoriaRow>([]);
  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.auditoriaService.findAll({ limit: 100 }).subscribe({
      next: (pagina) => {
        this.dataSource.data = pagina.items.map((r) => ({
          ...r,
          usuarioNombre: `${r.usuario.nombres} ${r.usuario.apellidos}`,
          detalleTexto: r.detalle ? JSON.stringify(r.detalle) : '',
        }));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }
}
