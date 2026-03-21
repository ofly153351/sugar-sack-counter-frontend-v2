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

// Count Types
export type SessionType = "sack" | "box";
export type SessionStatus =
  | "completed"
  | "pending"
  | "cancelled"
  | "in_progress";

export interface CountingSession {
  id?: string | number;
  sessionType: SessionType;
  userId: string | number;
  vehicleId: string | number;
  sugarTypeId: string | number;
  totalCount?: number;
  totalWeight?: number; // For sacks only
  countingDate: string;
  status: SessionStatus;
  createdAt?: string;
  updatedAt?: string;

  // Relations (optional, may be included in API response)
  user?: User;
  vehicle?: Vehicle;
  sugarType?: SugarType;
  sackSession?: SackCountingSession;
  boxSession?: BoxCountingSession;
}

export interface CountingSessionFormData {
  sessionType: SessionType;
  userId: string | number;
  vehicleId: string | number;
  sugarTypeId: string | number;
  countingDate: string;
  status?: SessionStatus;
  sackSessionId?: string | number | null;
  boxSessionId?: string | number | null;
}

// ========== Sack Counting Session Types ==========

export interface SackCountingSession {
  id?: string | number;
  counting_session_id?: string | number;
  vehicleId: string | number;
  sugarTypeId: string | number;
  userId: string | number;
  totalSacks?: number;
  totalWeight?: number;
  countingDate: string;
  status: "completed" | "in_progress" | "cancelled";
  createdAt?: string;
  updatedAt?: string;

  // Relations
  vehicle?: Vehicle;
  sugarType?: SugarType;
  user?: User;
  sackRows?: SackRow[];
  countingSession?: CountingSession;
}

export interface SackCountingSessionFormData {
  vehicleId: string | number;
  sugarTypeId: string | number;
  userId: string | number;
  totalSacks?: number;
  totalWeight?: number;
  countingDate: string;
  status?: "completed" | "in_progress" | "cancelled";
}

// ========== Box Counting Session Types ==========

export interface BoxCountingSession {
  id?: string | number;
  counting_session_id?: string | number;
  vehicleId: string | number;
  sugarTypeId: string | number;
  userId: string | number;
  totalBoxes?: number;
  countingDate: string;
  status: "completed" | "in_progress" | "cancelled";
  createdAt?: string;
  updatedAt?: string;

  // Relations
  vehicle?: Vehicle;
  sugarType?: SugarType;
  user?: User;
  boxRows?: BoxRow[];
  countingSession?: CountingSession;
}

export interface BoxCountingSessionFormData {
  vehicleId: string | number;
  sugarTypeId: string | number;
  userId: string | number;
  totalBoxes?: number;
  countingDate: string;
  status?: "completed" | "in_progress" | "cancelled";
}

// ========== Row Types ==========

export interface SackRow {
  id?: string | number;
  sessionId: string | number;
  rowNumber: number;
  weightType: string; // e.g., "50kg", "100kg"
  aiCount?: number;
  finalCount: number;
  imagePath?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SackRowFormData {
  sessionId: string | number;
  rowNumber: number;
  weightType: string;
  aiCount?: number;
  finalCount: number;
  originalImagePath?: string;
  annotatedImagePath?: string;
  originalImageDataUrl?: string;
  annotatedImageDataUrl?: string;
}

export interface BoxRow {
  id?: string | number;
  sessionId: string | number;
  rowNumber: number;
  aiCount?: number;
  finalCount: number;
  imagePath?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoxRowFormData {
  sessionId: string | number;
  rowNumber: number;
  aiCount?: number;
  finalCount: number;
  originalImagePath?: string;
  annotatedImagePath?: string;
  originalImageDataUrl?: string;
  annotatedImageDataUrl?: string;
}

// ========== Related Data Types ==========

export interface Vehicle {
  id?: string | number;
  vehicleCode: string;
  licensePlate: string;
  vehicleTypeId: string | number;
  maxLoadWeightTon: number;
  vehicleType?: VehicleType;
  driverUserId?: string | number;
  driverName: string;
  driver?: User;
  sackRows?: number[];
  totalSacks?: number;
  status: "active" | "inactive" | "maintenance";
  createdAt?: string;
  updatedAt?: string;
}

export interface SugarType {
  id: string | number;
  name: string;
  description?: string;
}

export interface User {
  id: string | number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  firstname?: string;
  lastname?: string;
  role?: string;
  phone?: string;
  employeeCode?: string;
  empCode?: string;
  title?: string;
  no?: number;
  password?: string;
}

// Register Types
export interface RegisterFormData {
  username: string;
  employeecode: string;
  title: string;
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

// Component Types
export interface Option {
  value: string;
  label: string;
}

export interface CustomDropdownProps {
  options: Option[];
  selected: string;
  setSelected: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  suppressHydrationWarning?: boolean;
}

// Admin Types
export interface UserFormData {
  email: string;
  password?: string;
  username: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  phone: string;
  title: string;
  role?: string;
}

export interface ApiUser {
  id: string | number;
  employeeCode?: string;
  empCode?: string;
  firstName?: string;
  firstname?: string;
  lastName?: string;
  lastname?: string;
  role?: string;
  phone?: string;
  email?: string;
  username?: string;
  password?: string;
  no?: number;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleType {
  id: string | number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleTypeFormData {
  name: string;
}

export interface VehicleFormData {
  vehicleCode: string;
  licensePlate: string;
  vehicleTypeId: string | number;
  maxLoadWeightTon: number;
  driverUserId: string | number;
  sackRows?: Array<{ rowNumber: number; sackCount: number }>;
  bagRows?: Array<{ rowNumber: number; bagCount: number }>;
  status: "active" | "inactive" | "maintenance";
}

export interface ApiVehicle {
  id: string | number;
  vehicleCode: string;
  licensePlate: string;
  vehicleTypeId: string | number;
  maxLoadWeightTon: number;
  vehicleType?: VehicleType;
  driverUserId?: string | number;
  driverName: string;
  driver?: ApiUser;
  sackRows?: Array<{ rowNumber: number; sackCount: number }>;
  bagRows?: Array<{ rowNumber: number; bagCount: number }>;
  totalSacks?: number;
  status: "active" | "inactive" | "maintenance";
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id?: string | number;
  productCode: string;
  productName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  productCode: string;
  productName: string;
}

export interface ApiProduct {
  id: string | number;
  productCode: string;
  productName: string;
  createdAt?: string;
  updatedAt?: string;
}

// Store Types
export interface StoreUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  employeeCode: string;
  role: string;
}

export interface UserStore {
  user: StoreUser | null;
  isAuthenticated: boolean;
  setUser: (user: StoreUser) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<StoreUser>) => void;
}
