export interface RegisterFormData {
  name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

// Has to match the backend `models.RegisterResponse`
export interface RegisterResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
  required: boolean;
}
