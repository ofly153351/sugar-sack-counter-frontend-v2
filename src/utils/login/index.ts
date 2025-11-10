// src/utils/login/index.ts

// Export all login utilities
export * from "./auth";
export * from "./forms";
export * from "./api";
// i18n utilities removed - use common.json directly

// Re-export types for convenience
export type {
  LoginCredentials,
  LoginResponse,
  UserRole,
  AuthTokens,
  FormField,
  FormState,
  ValidationResult,
  Dictionary,
  Locale,
} from "../types";
