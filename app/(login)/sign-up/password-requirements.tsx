import { Check, X } from "lucide-react";

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({ password, className = "" }: PasswordRequirementsProps) {
  const requirements: PasswordRequirement[] = [
    {
      label: "Au moins 8 caractères",
      regex: /.{8,}/,
      met: password.length >= 8,
    },
    {
      label: "Au moins une minuscule (a-z)",
      regex: /^(?=.*[a-z])/,
      met: /[a-z]/.test(password),
    },
    {
      label: "Au moins une majuscule (A-Z)",
      regex: /^(?=.*[A-Z])/,
      met: /[A-Z]/.test(password),
    },
    {
      label: "Au moins un chiffre (0-9)",
      regex: /^(?=.*\d)/,
      met: /\d/.test(password),
    },
    {
      label: "Au moins un caractère spécial (@$!%*?&)",
      regex: /^(?=.*[@$!%*?&])/,
      met: /[@$!%*?&]/.test(password),
    },
  ];

  // Check if all requirements are met
  const allRequirementsMet = requirements.every(req => req.met);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2">
        Exigences du mot de passe :
      </div>
      {requirements.map((requirement, index) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
            requirement.met 
              ? "bg-green-100 text-green-600" 
              : "bg-red-100 text-red-600"
          }`}>
            {requirement.met ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
          </div>
          <span className={
            requirement.met 
              ? "text-green-600" 
              : "text-red-600"
          }>
            {requirement.label}
          </span>
        </div>
      ))}
      
      {/* Overall status indicator */}
      {password && (
        <div className={`flex items-center space-x-2 text-sm font-medium pt-2 border-t ${
          allRequirementsMet ? "text-green-600" : "text-red-600"
        }`}>
          <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
            allRequirementsMet 
              ? "bg-green-100 text-green-600" 
              : "bg-red-100 text-red-600"
          }`}>
            {allRequirementsMet ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
          </div>
          <span>
            {allRequirementsMet 
              ? "Mot de passe valide ✓" 
              : "Mot de passe non conforme"
            }
          </span>
        </div>
      )}
    </div>
  );
}

// Helper function to validate password (mirrors backend validation)
export const validatePasswordComplexity = (password: string) => {
  const requirements = [
    { test: password.length >= 8, message: "Le mot de passe doit contenir au moins 8 caractères" },
    { test: password.length <= 100, message: "Le mot de passe ne peut pas dépasser 100 caractères" },
    { test: /[a-z]/.test(password), message: "Le mot de passe doit contenir au moins une minuscule" },
    { test: /[A-Z]/.test(password), message: "Le mot de passe doit contenir au moins une majuscule" },
    { test: /\d/.test(password), message: "Le mot de passe doit contenir au moins un chiffre" },
    { test: /[@$!%*?&]/.test(password), message: "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)" },
  ];

  const failedRequirements = requirements.filter(req => !req.test);
  
  return {
    valid: failedRequirements.length === 0,
    errors: failedRequirements.map(req => req.message)
  };
};
