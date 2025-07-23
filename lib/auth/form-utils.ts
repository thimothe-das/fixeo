import { useEffect } from 'react';
import { ActionState } from './middleware';

// Generic form state type that preserves all form fields
export type FormState<T = Record<string, any>> = ActionState & T;

// Hook for managing form state with automatic controlled input updates
export function useFormState<T extends Record<string, any>>(
  state: FormState<T> | undefined,
  controlledFields: Partial<T>,
  setters: Partial<Record<keyof T, (value: any) => void>>
) {
  useEffect(() => {
    if (!state) return;
    
    Object.entries(controlledFields).forEach(([key, currentValue]) => {
      const stateValue = state[key];
      const setter = setters[key];
      
      if (stateValue && stateValue !== currentValue && setter) {
        // Handle JSON fields (like specialties)
        try {
          if (typeof stateValue === 'string' && stateValue.startsWith('[')) {
            setter(JSON.parse(stateValue));
          } else {
            setter(stateValue);
          }
        } catch {
          setter(stateValue);
        }
      }
    });
  }, [state, controlledFields, setters]);
}

// Safe value getter with default fallback
export function getFormValue<T>(
  state: FormState<T> | undefined,
  field: keyof T,
  defaultValue: any = ''
): any {
  return state?.[field] ?? defaultValue;
}

// Helper to get form field props with defaultValue
export function getFormFieldProps<T>(
  state: FormState<T> | undefined,
  field: keyof T,
  additionalProps: any = {}
) {
  return {
    ...additionalProps,
    defaultValue: getFormValue(state, field, '')
  };
}

// Enhanced form submission handler that preserves state on errors
export function createFormAction<T extends Record<string, any>>(
  action: (prevState: FormState<T>, formData: FormData) => Promise<FormState<T>>
) {
  return async (prevState: FormState<T>, formData: FormData): Promise<FormState<T>> => {
    try {
      const result = await action(prevState, formData);
      
      // If there's an error, ensure all form data is preserved
      if (result.error) {
        const formDataEntries = Object.fromEntries(formData) as T;
        return {
          ...result,
          ...formDataEntries
        };
      }
      
      return result;
    } catch (error) {
      // On unexpected errors, preserve form data
      const formDataEntries = Object.fromEntries(formData) as T;
      return {
        error: 'An unexpected error occurred. Please try again.',
        ...formDataEntries
      };
    }
  };
}

// Common form field types
export interface BaseFormFields {
  email?: string;
  password?: string;
  error?: string;
  success?: string;
}

export interface SignUpFormFields extends BaseFormFields {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  serviceArea?: string;
  siret?: string;
  experience?: string;
  specialties?: string;
  description?: string;
  role?: string;
}

export interface ServiceRequestFormFields extends BaseFormFields {
  serviceType?: string;
  urgency?: string;
  description?: string;
  location?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

export interface PasswordFormFields extends BaseFormFields {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
} 