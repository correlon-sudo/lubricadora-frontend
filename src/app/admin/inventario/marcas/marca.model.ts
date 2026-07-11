export interface Marca {
  id: string;
  nombre: string;
}

export interface CreateMarca {
  nombre: string;
}

export type UpdateMarca = Partial<CreateMarca>;
