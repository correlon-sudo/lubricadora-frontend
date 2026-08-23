import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Producto } from '../../inventario/productos/producto.model';
import { Sucursal } from '../../sucursales/sucursal.model';
import { CreateTransferenciaItem } from '../transferencia.model';

export interface TransferenciaFormDialogData {
  productos: Producto[];
  sucursales: Sucursal[];
  sucursalOrigenId: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-transferencia-form-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva transferencia</h2>
    <mat-dialog-content>
      <mat-form-field class="w-100" appearance="outline">
        <mat-label>Sucursal destino</mat-label>
        <mat-select [ngModel]="sucursalDestinoId()" (ngModelChange)="sucursalDestinoId.set($event)">
          @for (s of sucursalesDestino; track s.id) {
            <mat-option [value]="s.id">{{ s.nombre }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field class="w-100" appearance="outline">
        <mat-label>Observación (opcional)</mat-label>
        <input matInput [ngModel]="observacion()" (ngModelChange)="observacion.set($event)" />
      </mat-form-field>

      <h5>Productos</h5>
      @for (linea of items(); track $index) {
        <div class="row mb-2">
          <div class="col-6">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Producto</mat-label>
              <input
                matInput
                [ngModel]="busquedas()[$index]"
                (ngModelChange)="onBusquedaChange($index, $event)"
                [matAutocomplete]="auto"
                placeholder="Buscar por código o nombre…"
              />
              <mat-autocomplete
                #auto="matAutocomplete"
                (optionSelected)="onProductoSeleccionado($index, $event)"
              >
                @for (p of productosFiltrados(busquedas()[$index]); track p.id) {
                  <mat-option [value]="p.id">{{ p.codigo }} — {{ p.nombre }}</mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>
          </div>
          <div class="col-4">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Cantidad</mat-label>
              <input
                matInput
                type="number"
                min="1"
                [ngModel]="linea.cantidad"
                (ngModelChange)="actualizarLinea($index, 'cantidad', +$event)"
              />
            </mat-form-field>
          </div>
          <div class="col-2 d-flex align-items-center">
            @if (items().length > 1) {
              <button mat-icon-button type="button" (click)="quitarLinea($index)">
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
        </div>
      }
      <button mat-stroked-button type="button" (click)="agregarLinea()">
        + Agregar producto
      </button>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="null">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!esValido()"
        (click)="onSubmit()"
      >
        Crear transferencia
      </button>
    </mat-dialog-actions>
  `,
})
export class TransferenciaFormDialogComponent {
  data = inject<TransferenciaFormDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<TransferenciaFormDialogComponent>);

  sucursalesDestino = this.data.sucursales.filter((s) => s.id !== this.data.sucursalOrigenId);

  sucursalDestinoId = signal(this.sucursalesDestino[0]?.id ?? '');
  observacion = signal('');
  items = signal<CreateTransferenciaItem[]>([{ productoId: '', cantidad: 1 }]);
  busquedas = signal<string[]>(['']);

  esValido(): boolean {
    return (
      !!this.sucursalDestinoId() &&
      this.items().length > 0 &&
      this.items().every((i) => i.productoId && i.cantidad > 0)
    );
  }

  productosFiltrados(termino: string): Producto[] {
    const t = termino.trim().toLowerCase();
    if (!t) return this.data.productos;
    return this.data.productos.filter(
      (p) => p.nombre.toLowerCase().includes(t) || p.codigo.toLowerCase().includes(t),
    );
  }

  onBusquedaChange(index: number, valor: string) {
    this.busquedas.update((b) => b.map((v, i) => (i === index ? valor : v)));
    this.actualizarLinea(index, 'productoId', '');
  }

  onProductoSeleccionado(index: number, event: MatAutocompleteSelectedEvent) {
    const productoId = event.option.value as string;
    const producto = this.data.productos.find((p) => p.id === productoId);
    this.actualizarLinea(index, 'productoId', productoId);
    this.busquedas.update((b) =>
      b.map((v, i) => (i === index ? `${producto?.codigo} — ${producto?.nombre}` : v)),
    );
  }

  agregarLinea() {
    this.items.update((lineas) => [...lineas, { productoId: '', cantidad: 1 }]);
    this.busquedas.update((b) => [...b, '']);
  }

  quitarLinea(index: number) {
    this.items.update((lineas) => lineas.filter((_, i) => i !== index));
    this.busquedas.update((b) => b.filter((_, i) => i !== index));
  }

  actualizarLinea(index: number, campo: keyof CreateTransferenciaItem, valor: string | number) {
    this.items.update((lineas) =>
      lineas.map((l, i) => (i === index ? { ...l, [campo]: valor } : l)),
    );
  }

  onSubmit() {
    if (!this.esValido()) return;
    this.dialogRef.close({
      sucursalDestinoId: this.sucursalDestinoId(),
      observacion: this.observacion() || undefined,
      items: this.items(),
    });
  }
}
