export interface User {
  id?: string;
  full_name: string;
  email: string;
  password: string;
  role: string;
  created_at?: Date;
}
