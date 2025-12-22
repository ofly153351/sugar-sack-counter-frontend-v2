// src/utils/register/validation.ts

import {
  RegisterFormData,
  RegisterValidationResult,
  ValidationRules,
} from "../types";

export const validationRules: ValidationRules = {
  username: {
    pattern: /^[A-Za-z0-9]{6,}$/,
    message: "ต้องเป็นภาษาอังกฤษหรือตัวเลขอย่างน้อย 6 ตัว และไม่มีช่องว่าง",
  },
  employeecode: {
    pattern: /^[A-Za-z0-9]{6,}$/,
    message: "ต้องเป็นภาษาอังกฤษหรือตัวเลขอย่างน้อย 6 ตัว และไม่มีช่องว่าง",
  },
  firstName: {
    pattern: /^[A-Za-zก-๙]+$/,
    message: "ต้องเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น และไม่มีช่องว่าง",
  },
  lastName: {
    pattern: /^[A-Za-zก-๙]+$/,
    message: "ต้องเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น และไม่มีช่องว่าง",
  },
  phone: {
    pattern: /^(06|08|09)\d{8}$/,
    message: "เบอร์โทรศัพท์ต้องมี 10 หลักและขึ้นต้นด้วย 06, 08 หรือ 09",
  },
  email: {
    pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    message: "กรุณากรอกอีเมลให้ถูกต้อง",
  },
  password: {
    pattern: /^[A-Za-z0-9]{6,}$/,
    message: "ต้องเป็นภาษาอังกฤษหรือตัวเลขอย่างน้อย 6 ตัว และไม่มีช่องว่าง",
  },
};

/**
 * Validate individual field based on field name and value
 */
export const validateField = (
  name: string,
  value: string,
  formData?: RegisterFormData
): string => {
  let message = "";

  switch (name) {
    case "username":
    case "employeecode":
    case "firstName":
    case "lastName":
    case "phone":
    case "email":
    case "password":
      if (validationRules[name] && !validationRules[name].pattern.test(value)) {
        message = validationRules[name].message;
      }
      break;

    case "confirmPassword":
      if (formData && value !== formData.password) {
        message = "รหัสผ่านไม่ตรงกัน";
      }
      break;

    case "title":
      if (!value.trim()) {
        message = "กรุณาเลือกคำนำหน้า";
      }
      break;
  }

  return message;
};

/**
 * Validate entire registration form
 */
export const validateRegisterForm = (
  formData: RegisterFormData
): RegisterValidationResult => {
  const errors: Record<string, string> = {};

  Object.entries(formData).forEach(([name, value]) => {
    const error = validateField(name, value, formData);
    if (error) {
      errors[name] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Check if all required fields are filled
 */
export const areRequiredFieldsFilled = (
  formData: RegisterFormData
): boolean => {
  const requiredFields = [
    "username",
    "employeecode",
    "title",
    "firstName",
    "lastName",
    "phone",
    "email",
    "password",
    "confirmPassword",
  ];

  return requiredFields.every((field) => {
    const value = formData[field as keyof RegisterFormData];
    return value && value.trim() !== "";
  });
};

/**
 * Get field validation pattern by name
 */
export const getFieldPattern = (fieldName: string): RegExp | null => {
  return validationRules[fieldName]?.pattern || null;
};

/**
 * Get field validation message by name
 */
export const getFieldMessage = (fieldName: string): string => {
  return validationRules[fieldName]?.message || "Invalid field";
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  return validationRules.phone.pattern.test(phone);
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  return validationRules.email.pattern.test(email);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): boolean => {
  return validationRules.password.pattern.test(password);
};

/**
 * Check if passwords match
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};
