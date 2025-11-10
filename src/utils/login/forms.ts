// src/utils/login/forms.ts

import { useState, ChangeEvent, FormEvent } from 'react';
import { FormField, FormState, ValidationResult, LoginCredentials } from '../types';

/**
 * Hook for managing login form state
 */
export const useLoginForm = () => {
  const initialFormState: FormState = {
    fields: {
      username: {
        name: 'username',
        value: '',
        required: true,
        pattern: /^[A-Za-z0-9]{6,}$/,
        error: '',
        placeholder: 'Username'
      },
      password: {
        name: 'password',
        value: '',
        required: true,
        pattern: /^[A-Za-z0-9]{6,}$/,
        error: '',
        placeholder: 'Password'
      }
    },
    isLoading: false,
    errors: {},
    isValid: false,
  };

  const [formState, setFormState] = useState<FormState>(initialFormState);

  /**
   * Update form field value
   */
  const updateField = (name: string, value: string) => {
    setFormState(prev => {
      const newFields = {
        ...prev.fields,
        [name]: {
          ...prev.fields[name],
          value,
          error: '',
        },
      };

      const validation = validateLoginForm(newFields);

      return {
        ...prev,
        fields: newFields,
        errors: validation.errors,
        isValid: validation.isValid,
      };
    });
  };

  /**
   * Handle input change event
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      isValid: Object.keys(errors).length === 0,
    }));
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormState(initialFormState);
  };

  /**
   * Get form values as LoginCredentials
   */
  const getFormValues = (): LoginCredentials => {
    return {
      username: formState.fields.username.value,
      password: formState.fields.password.value,
    };
  };

  /**
   * Validate individual field
   */
  const validateField = (field: FormField): string => {
    if (field.required && !field.value.trim()) {
      return 'This field is required';
    }

    if (field.pattern && field.value && !field.pattern.test(field.value)) {
      return 'Invalid format';
    }

    return '';
  };

  /**
   * Validate entire login form
   */
  const validateLoginForm = (fields: Record<string, FormField> = formState.fields): ValidationResult => {
    const errors: Record<string, string> = {};

    Object.entries(fields).forEach(([name, field]) => {
      const error = validateField(field);
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
   * Submit login form handler
   */
  const handleSubmit = async (
    onSubmit: (credentials: LoginCredentials) => Promise<void>,
    e?: FormEvent
  ) => {
    if (e) {
      e.preventDefault();
    }

    const validation = validateLoginForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onSubmit(getFormValues());
    } catch (error) {
      console.error('Login form submission error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Login failed'
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
    getFormValues,
    validateLoginForm,
    handleSubmit,
  };
};

/**
 * Password visibility toggle hook for login forms
 */
export const usePasswordVisibility = (initialState = false) => {
  const [isVisible, setIsVisible] = useState(initialState);

  const toggleVisibility = () => setIsVisible(prev => !prev);

  const getInputType = () => (isVisible ? 'text' : 'password');

  const getVisibilityIcon = () => (isVisible ? '🙈' : '👁️');

  return {
    isVisible,
    toggleVisibility,
    getInputType,
    getVisibilityIcon,
  };
};

/**
 * Format login credentials for API submission
 */
export const formatLoginData = (credentials: LoginCredentials): FormData => {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  return formData;
};

/**
 * Extract login credentials from form data
 */
export const extractLoginCredentials = (formData: FormData): LoginCredentials => {
  return {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  };
};

/**
 * Check if form has any values
 */
export const hasFormValues = (formState: FormState): boolean => {
  return Object.values(formState.fields).some(field => field.value.trim() !== '');
};

/**
 * Clear form errors
 */
export const clearFormErrors = (setErrors: (errors: Record<string, string>) => void) => {
  setErrors({});
};
