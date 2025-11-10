// src/utils/types.ts

// i18n Types
export interface Dictionary {
  welcome: string;
  logout: string;
  signIn: string;
  username: string;
  password: string;
  required: string;
  forgotPassword: string;
  signingIn: string;
  dontHaveAccount: string;
  signUp: string;
  usernameError: string;
  passwordError: string;
  loginFailed: string;
}

export type Locale = "en" | "th";

// Auth Types
export interface AuthTokens {
  token: string;
  role: UserRole;
  expiresAt?: Date;
}

export type UserRole = "admin" | "user" | "viewer";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  role?: UserRole;
  message?: string;
}

// Form Types
export interface FormField {
  name: string;
  value: string;
  required?: boolean;
  pattern?: RegExp;
  error?: string;
  placeholder?: string;
}

export interface FormState {
  fields: Record<string, FormField>;
  isLoading: boolean;
  errors: Record<string, string>;
  isValid: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Component Props Types
export interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export interface LoginFormProps {
  locale: Locale;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Route Types
export interface RouteParams {
  locale: Locale;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}
