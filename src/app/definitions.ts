/* -- Authentication -- */
export interface RegisterFormData {
  name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  // Has to match the backend `models.AuthResponse`
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  accessToken?: string;
}

export type AuthResult = {
  isAuthenticated: boolean;
  userId?: number;
};

export type CookieAccessor = {
  get: (name: string) => { value: string } | undefined;
};

export type User = {
  id: number;
  name: string;
  last_name: string;
  email: string;
  created_at: string;
};
