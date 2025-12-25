import type { Role } from '../types/user';

export interface RegisterDto {
  full_name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}
