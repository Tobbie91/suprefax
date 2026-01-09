/**
 * Form Schema Types
 * Schema-driven form system that maps directly to document templates
 */

// Field types supported by the form engine
export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'textarea'
  | 'select'
  | 'multi-select'
  | 'radio'
  | 'checkbox'
  | 'checkbox-group'
  | 'file'
  | 'file-multiple'
  | 'country'
  | 'address'
  | 'icon-select'
  | 'rich-text';

// Operators for conditional expressions
export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equals'
  | 'less_than_or_equals'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty';

// Conditional expression for showing/hiding fields
export interface ConditionalExpression {
  field: string;
  operator: ConditionalOperator;
  value?: unknown;
  and?: ConditionalExpression[];
  or?: ConditionalExpression[];
}

// Select option for dropdowns, radios, etc.
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

// Field validation rules
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  custom?: string; // Custom validation function name
}

// Individual form field definition
export interface FormField {
  id: string;
  name: string; // Dot notation path: "personal.fullName"
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  defaultValue?: unknown;

  // Validation
  validation?: FieldValidation;

  // Conditional rendering
  showIf?: ConditionalExpression;

  // Type-specific options
  options?: SelectOption[]; // For select, radio, checkbox-group, icon-select
  accept?: string; // For file inputs (e.g., ".pdf,.jpg,.png")
  maxSize?: number; // For file inputs (bytes)
  multiple?: boolean; // For file/select
  min?: number; // For number/date
  max?: number; // For number/date
  rows?: number; // For textarea

  // Document template mapping
  templateVariable?: string; // Maps to document template variable

  // Prefill from another field
  prefillFrom?: string; // Field name to prefill from
}

// Form section containing multiple fields
export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  showIf?: ConditionalExpression;
}

// Step validation rules
export interface StepValidation {
  type: 'all_required' | 'at_least_one' | 'custom';
  fields?: string[];
  customValidator?: string;
}

// Form step (for multi-step forms)
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  sections?: FormSection[];
  fields?: FormField[]; // Direct fields (no sections)
  validationRules?: StepValidation[];
  showIf?: ConditionalExpression;
}

// Form validation configuration
export interface ValidationConfig {
  validateOnBlur: boolean;
  validateOnChange: boolean;
  showErrorsOnSubmit: boolean;
}

// Conditional action types
export type ConditionalActionType =
  | 'show'
  | 'hide'
  | 'enable'
  | 'disable'
  | 'setValue'
  | 'setOptions'
  | 'setRequired';

// Conditional action
export interface ConditionalAction {
  type: ConditionalActionType;
  target: string; // Field name or step/section id
  value?: unknown;
}

// Conditional rule
export interface ConditionalRule {
  id: string;
  condition: ConditionalExpression;
  actions: ConditionalAction[];
}

// Main form schema
export interface FormSchema {
  id: string;
  version: number;
  title: string;
  description?: string;
  steps: FormStep[];
  validation: ValidationConfig;
  conditionals?: ConditionalRule[];
}

// Form data structure (generic)
export type FormData = Record<string, unknown>;

// Form context value
export interface FormContextValue {
  schema: FormSchema;
  currentStep: number;
  formData: FormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Form engine props
export interface FormEngineProps {
  schema: FormSchema;
  initialData?: FormData;
  onSubmit: (data: FormData) => Promise<void>;
  onSaveDraft?: (data: FormData, step: number) => Promise<void>;
  onStepChange?: (step: number, data: FormData) => void;
  isLoading?: boolean;
}

// Field component props
export interface FieldProps {
  field: FormField;
  value?: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

// Field renderer props
export interface FieldRendererProps {
  field: FormField;
}
