export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface CreateCategoria {
  nombre: string;
  descripcion?: string;
}

export type UpdateCategoria = Partial<CreateCategoria>;
