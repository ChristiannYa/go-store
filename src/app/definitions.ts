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
  isLoading: boolean;
  setAccessToken: (token: string | null) => void;
  refreshToken: () => Promise<string | null>;
}

export interface AuthVerificationOptions {
  timeout?: number;
  cookies?: string /* For route middleware */;
}

export interface AuthVerificationResponse {
  isAuthenticated: boolean;
  error?: string;
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
  created_at: string;
};
