// src/utils/register/forms.ts

import { useState, ChangeEvent } from 'react';
import { RegisterFormData, RegisterFormState, InputFieldProps } from './types';
import { validateField, validateRegisterForm } from './validation';

/**
 * Initial form data for registration
 */
export const initialFormData: RegisterFormData = {
  username: "",
  employeecode: "",
  prefix: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

/**
 * Initial form state for registration
 */
export const initialFormState: RegisterFormState = {
  formData: initialFormData,
  errors: {},
  isLoading: false,
};

/**
 * Hook for managing registration form state
 */
export const useRegisterForm = () => {
  const [formState, setFormState] = useState<RegisterFormState>(initialFormState);

  /**
   * Update form field value
   */
  const updateField = (name: string, value: string) => {
    setFormState(prev => {
      const newFormData = {
        ...prev.formData,
        [name]: value,
      };

      const error = validateField(name, value, newFormData);

      return {
        ...prev,
        formData: newFormData,
        errors: {
          ...prev.errors,
          [name]: error,
        },
      };
    });
  };

  /**
   * Handle input change event
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  /**
   * Set form loading state
   */
  const setLoading = (isLoading: boolean) => {
    setFormState(prev => ({
      ...prev,
      isLoading,
    }));
  };

  /**
   * Set form errors
   */
  const setErrors = (errors: Record<string, string>) => {
    setFormState(prev => ({
      ...prev,
      errors,
    }));
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormState(initialFormState);
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const validation = validateRegisterForm(formState.formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  /**
   * Submit form handler
   */
  const handleSubmit = async (
    onSubmit: (formData: RegisterFormData) => Promise<void>,
    e?: React.FormEvent
  ) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formState.formData);
    } catch (error) {
      console.error('Registration form submission error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formState,
    updateField,
    handleInputChange,
    setLoading,
    setErrors,
    resetForm,
    validateForm,
    handleSubmit,
  };
};

/**
 * InputField component for registration form
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
        placeholder={placeholder}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

/**
 * Get form progress percentage
 */
export const getFormProgress = (formData: RegisterFormData): number => {
  const requiredFields = [
    "username",
    "employeecode",
    "prefix",
    "firstName",
    "lastName",
    "phone",
    "email",
    "password",
    "confirmPassword",
  ];

  const filledFields = requiredFields.filter(field => {
    const value = formData[field as keyof RegisterFormData];
    return value && value.trim() !== "";
  });

  return Math.round((filledFields.length / requiredFields.length) * 100);
};

/**
 * Check if form can be submitted
 */
export const canSubmitForm = (formState: RegisterFormState): boolean => {
  const validation = validateRegisterForm(formState.formData);
  return validation.isValid && !formState.isLoading;
};

/**
 * Extract user profile data from form
 */
export const extractUserProfile = (formData: RegisterFormData) => {
  return {
    username: formData.username,
    employeeCode: formData.employeecode,
    prefix: formData.prefix,
    firstName: formData.firstName,
    lastName: formData.lastName,
    fullName: `${formData.firstName} ${formData.lastName}`,
    phone: formData.phone,
    email: formData.email,
  };
};
