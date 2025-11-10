// src/utils/register/types.ts

import { UserRole } from "../types";

export interface RegisterFormData {
  username: string;
  employeecode: string;
  prefix: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
}

export interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}

export interface RegisterFormState {
  formData: RegisterFormData;
  errors: Record<string, string>;
  isLoading: boolean;
}

export interface ValidationRule {
  pattern: RegExp;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}
