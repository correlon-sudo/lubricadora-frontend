import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormaPago, TipoComprobante } from '../../venta.model';
import { Cotizacion } from '../cotizacion.model';

export interface ConvertirDialogData {
  cotizacion: Cotizacion;
}

interface PagoLinea {
  formaPago: FormaPago;
  monto: number;
  referencia: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-convertir-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Convertir cotización {{ data.cotizacion.numero }} a venta</h2>
    <mat-dialog-content>
      <mat-form-field class="w-100" appearance="outline">
        <mat-label>Tipo de comprobante</mat-label>
        <mat-select [ngModel]="tipoComprobante()" (ngModelChange)="tipoComprobante.set($event)">
          @for (t of tiposComprobante; track t) {
            <mat-option [value]="t">{{ t }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <p>Total a pagar: <strong>&#36;{{ data.cotizacion.total.toFixed(2) }}</strong></p>

      @for (pago of pagos(); track $index) {
        <div class="row mb-2">
          <div class="col-5">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Forma</mat-label>
              <mat-select
                [ngModel]="pago.formaPago"
                (ngModelChange)="actualizarPago($index, 'formaPago', $event)"
              >
                @for (f of formasPago; track f) {
                  <mat-option [value]="f">{{ f }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="col-5">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Monto</mat-label>
              <input
                matInput
                type="number"
                step="0.01"
                [ngModel]="pago.monto"
                (ngModelChange)="actualizarPago($index, 'monto', +$event)"
              />
            </mat-form-field>
          </div>
          <div class="col-2 d-flex align-items-center">
            @if (pagos().length > 1) {
              <button mat-icon-button type="button" (click)="quitarPago($index)">
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
        </div>
      }
      <button mat-stroked-button type="button" (click)="agregarPago()">
        + Agregar pago
      </button>

      <div class="mt-2" [class.text-danger]="!pagosCuadran()">
        Pagado: &#36;{{ sumaPagos().toFixed(2) }}
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!pagosCuadran()"
        (click)="onConfirmar()"
      >
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
})
export class ConvertirDialogComponent {
  data = inject<ConvertirDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ConvertirDialogComponent>);

  tiposComprobante: TipoComprobante[] = [
    'NOTA_VENTA',
    'FACTURA',
    'NOTA_PEDIDO',
    'NOTA_ENTREGA',
  ];
  formasPago: FormaPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'];

  tipoComprobante = signal<TipoComprobante>('NOTA_VENTA');
  pagos = signal<PagoLinea[]>([
    { formaPago: 'EFECTIVO', monto: this.data.cotizacion.total, referencia: '' },
  ]);

  sumaPagos() {
    return Math.round(this.pagos().reduce((s, p) => s + (p.monto || 0), 0) * 100) / 100;
  }

  pagosCuadran() {
    return Math.abs(this.sumaPagos() - this.data.cotizacion.total) < 0.01;
  }

  agregarPago() {
    this.pagos.update((p) => [...p, { formaPago: 'EFECTIVO', monto: 0, referencia: '' }]);
  }

  quitarPago(index: number) {
    this.pagos.update((p) => p.filter((_, i) => i !== index));
  }

  actualizarPago(index: number, campo: keyof PagoLinea, valor: string | number) {
    this.pagos.update((p) =>
      p.map((pago, i) => (i === index ? { ...pago, [campo]: valor } : pago)),
    );
  }

  onConfirmar() {
    this.dialogRef.close({
      tipoComprobante: this.tipoComprobante(),
      pagos: this.pagos().map((p) => ({
        formaPago: p.formaPago,
        monto: p.monto,
        referencia: p.referencia || undefined,
      })),
    });
  }
}
