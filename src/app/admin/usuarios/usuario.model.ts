export type RolUsuario = 'ADMIN' | 'ENCARGADO' | 'VENDEDOR';

export interface Usuario {
  id: string;
  sucursalId: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  username: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUsuario {
  sucursalId: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  username: string;
  password: string;
  rol: RolUsuario;
}

export type UpdateUsuario = Partial<Omit<CreateUsuario, 'password'>>;
