export interface RegisterDto {
  full_name: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
