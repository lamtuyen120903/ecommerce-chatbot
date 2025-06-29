export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthError {
  field?: string;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  errors?: AuthError[];
  message?: string;
}
