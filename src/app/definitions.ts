/* -- General -- */
export interface ServerStatusContextType {
  isServerOnline: boolean;
  isCheckingServer: boolean;
  isServerCheckDone: boolean;
  checkServerStatus: () => Promise<void>;
}

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

export interface AuthVerificationHookResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export type CookieAccessor = {
  get: (name: string) => { value: string } | undefined;
};

export interface TokenContextType {
  accessToken: string | null;
  isTokenLoading: boolean;
  isLoggingOut: boolean;
  setAccessToken: (token: string | null) => void;
  refreshToken: () => Promise<string | null>;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

export interface AuthVerificationOptions {
  timeout?: number;
  cookies?: string /* For route middleware */;
}

export interface AuthVerificationResponse {
  isAuthenticated: boolean;
  error?: string;
}

export interface ResetPasswordFormProps {
  token: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  setIsSuccess: (success: boolean) => void;
}

export interface ForgotPasswordFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  error: string;
  setError: (error: string) => void;
  setIsSuccess: (success: boolean) => void;
}

/* -- API -- */
export type RequestData =
  | Record<string, unknown>
  | FormData
  | string
  | null
  | undefined;

// ApiHeaders type that allows string indexing
export interface ApiHeaders extends Record<string, string> {
  "Content-Type": string;
}

/* -- UI -- */
export interface ServerOfflinePageProps {
  onRetry: () => void;
  isCheckingServer: boolean;
}

/* -- User -- */
export type User = {
  id: number;
  name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  created_at: string;
};
