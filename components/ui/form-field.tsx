import React from "react";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { getFormValue, FormState } from "@/lib/auth/form-utils";

interface FormFieldProps {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  state?: FormState<any>;
  component?: "input" | "textarea";
  rows?: number;
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  className = "",
  state,
  component = "input",
  rows,
  minLength,
  maxLength,
  autoComplete,
}: FormFieldProps) {
  const defaultValue = getFormValue(state, name);

  const commonProps = {
    id: name,
    name,
    placeholder,
    required,
    className,
    defaultValue,
    minLength,
    maxLength,
    autoComplete,
  };

  return (
    <div>
      {label && (
        <Label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {component === "textarea" ? (
        <Textarea {...commonProps} rows={rows} />
      ) : (
        <Input {...commonProps} type={type} />
      )}
    </div>
  );
}

// Specialized variants for common use cases
export function EmailField({
  state,
  ...props
}: Omit<FormFieldProps, "type" | "name">) {
  return (
    <FormField
      {...props}
      name="email"
      type="email"
      autoComplete="email"
      state={state}
    />
  );
}

export function PasswordField({
  state,
  name = "password",
  ...props
}: Omit<FormFieldProps, "type">) {
  return (
    <FormField
      {...props}
      name={name}
      type="password"
      autoComplete={name === "password" ? "new-password" : "current-password"}
      state={state}
    />
  );
}

export function TextAreaField({
  state,
  ...props
}: Omit<FormFieldProps, "component">) {
  return <FormField {...props} component="textarea" state={state} />;
}
