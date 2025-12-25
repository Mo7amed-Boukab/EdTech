
export const ROLES = ['TEACHER', 'ADMIN', 'STUDENT'] as const;
export type Role = typeof ROLES[number];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && ROLES.includes(value.toUpperCase() as Role);
}


export interface User {
  id?: string;
  full_name: string;
  email: string;
  password: string;
  role: Role;
  created_at?: Date;
}
