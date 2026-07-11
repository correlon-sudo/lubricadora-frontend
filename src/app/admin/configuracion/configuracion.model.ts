export interface Configuracion {
  id: string;
  ruc: string | null;
  razonSocial: string | null;
  nombreComercial: string | null;
  direccion: string | null;
  telefono: string | null;
  logoUrl: string | null;
  porcentajeIva: number;
  moneda: string;
  updatedAt: string;
}

export type UpdateConfiguracion = Partial<
  Omit<Configuracion, 'id' | 'updatedAt'>
>;
