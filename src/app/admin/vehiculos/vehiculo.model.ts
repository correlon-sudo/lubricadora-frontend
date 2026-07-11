import { Cliente } from '../clientes/cliente.model';

export interface Vehiculo {
  id: string;
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  kilometraje: number | null;
  activo: boolean;
  cliente: Cliente;
}

export interface CreateVehiculo {
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  anio?: number;
  color?: string;
  kilometraje?: number;
}

export type UpdateVehiculo = Partial<CreateVehiculo>;

export interface VehiculoConHistorial extends Vehiculo {
  historialServicios: unknown[];
}
