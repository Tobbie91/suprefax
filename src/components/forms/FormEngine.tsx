import { useState, useCallback, useMemo } from 'react';
import { get, set } from 'lodash-es';
import type {
  FormSchema,
  FormStep,
  FormField,
  FormData,
  ConditionalExpression,
} from '@/types/form-schema.types';
import {
  Button,
  Input,
  FormField as FormFieldWrapper,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/common';
import { CheckboxWithLabel } from '@/components/common/Checkbox';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  Plane,
  FileText,
  TrendingUp,
  GitBranch,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping for icon-select field type
const iconMap: Record<string, LucideIcon> = {
  passport: Plane,
  'file-text': FileText,
  'trending-up': TrendingUp,
  'git-branch': GitBranch,
  'more-horizontal': MoreHorizontal,
};

interface FormEngineProps {
  schema: FormSchema;
  initialData?: FormData;
  onSubmit: (data: FormData) => Promise<void>;
  onSaveDraft?: (data: FormData, step: number) => Promise<void>;
  onCancel?: () => void;
}

// Evaluate conditional expression
function evaluateCondition(
  condition: ConditionalExpression,
  formData: FormData
): boolean {
  const fieldValue = get(formData, condition.field);

  let result = false;
  switch (condition.operator) {
    case 'equals':
      result = fieldValue === condition.value;
      break;
    case 'not_equals':
      result = fieldValue !== condition.value;
      break;
    case 'contains':
      result =
        typeof fieldValue === 'string' &&
        fieldValue.includes(String(condition.value));
      break;
    case 'is_empty':
      result = !fieldValue || fieldValue === '';
      break;
    case 'is_not_empty':
      result = !!fieldValue && fieldValue !== '';
      break;
    case 'in':
      result = Array.isArray(condition.value) && condition.value.includes(fieldValue);
      break;
    default:
      result = true;
  }

  // Handle AND conditions
  if (condition.and && condition.and.length > 0) {
    result = result && condition.and.every((c) => evaluateCondition(c, formData));
  }

  // Handle OR conditions
  if (condition.or && condition.or.length > 0) {
    result = result || condition.or.some((c) => evaluateCondition(c, formData));
  }

  return result;
}

// Check if field should be shown
function shouldShowField(field: FormField, formData: FormData): boolean {
  if (!field.showIf) return true;
  return evaluateCondition(field.showIf, formData);
}

// Check if step should be shown
function shouldShowStep(step: FormStep, formData: FormData): boolean {
  if (!step.showIf) return true;
  return evaluateCondition(step.showIf, formData);
}

// Check if section should be shown
function shouldShowSection(
  section: { showIf?: ConditionalExpression },
  formData: FormData
): boolean {
  if (!section.showIf) return true;
  return evaluateCondition(section.showIf, formData);
}

// Field renderer component
function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
      return (
        <FormFieldWrapper
          label={field.label}
          htmlFor={field.id}
          required={field.required}
          error={error}
          helpText={field.helpText}
        >
          <Input
            id={field.id}
            type={field.type === 'phone' ? 'tel' : field.type}
            placeholder={field.placeholder}
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            disabled={field.disabled}
          />
        </FormFieldWrapper>
      );

    case 'number':
    case 'currency':
      return (
        <FormFieldWrapper
          label={field.label}
          htmlFor={field.id}
          required={field.required}
          error={error}
          helpText={field.helpText}
        >
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={value !== undefined ? String(value) : ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            disabled={field.disabled}
          />
        </FormFieldWrapper>
      );

    case 'textarea':
      return (
        <FormFieldWrapper
          label={field.label}
          htmlFor={field.id}
          required={field.required}
          error={error}
          helpText={field.helpText}
        >
          <textarea
            id={field.id}
            className="flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-50"
            placeholder={field.placeholder}
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            disabled={field.disabled}
            rows={field.rows || 3}
          />
        </FormFieldWrapper>
      );

    case 'select':
    case 'country':
      return (
        <FormFieldWrapper
          label={field.label}
          htmlFor={field.id}
          required={field.required}
          error={error}
          helpText={field.helpText}
        >
          <select
            id={field.id}
            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-50"
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            disabled={field.disabled}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.type === 'country' ? (
              <>
                <option value="canada">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="usa">United States</option>
                <option value="australia">Australia</option>
                <option value="germany">Germany</option>
                <option value="france">France</option>
                <option value="ireland">Ireland</option>
                <option value="netherlands">Netherlands</option>
                <option value="cyprus">Cyprus</option>
                <option value="uae">United Arab Emirates</option>
                <option value="other">Other</option>
              </>
            ) : (
              field.options?.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
        </FormFieldWrapper>
      );

    case 'radio':
      return (
        <FormFieldWrapper
          label={field.label}
          htmlFor={field.id}
          required={field.required}
          error={error}
          helpText={field.helpText}
        >
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  value === opt.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="mt-0.5 h-4 w-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-neutral-900">{opt.label}</div>
                  {opt.description && (
                    <div className="text-sm text-neutral-500">{opt.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </FormFieldWrapper>
      );

    case 'checkbox':
      return (
        <div className="py-1">
          <CheckboxWithLabel
            id={field.id}
            label={field.label}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked)}
          />
          {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
        </div>
      );

    case 'file':
      return (
        <FormFieldWrapper
          label={field.label}
          htmlFor={field.id}
          required={field.required}
          error={error}
          helpText={field.helpText}
        >
          <input
            id={field.id}
            type="file"
            accept={field.accept}
            className="flex w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            onChange={(e) => {
              const file = e.target.files?.[0];
              onChange(file || null);
            }}
            disabled={field.disabled}
          />
        </FormFieldWrapper>
      );

    case 'date':
      return (
        <FormFieldWrapper
          label={field.label}
          htmlFor={field.id}
          required={field.required}
          error={error}
          helpText={field.helpText}
        >
          <Input
            id={field.id}
            type="date"
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            disabled={field.disabled}
          />
        </FormFieldWrapper>
      );

    case 'icon-select':
      return (
        <FormFieldWrapper
          label={field.label}
          htmlFor={field.id}
          required={field.required}
          error={error}
          helpText={field.helpText}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {field.options?.map((opt) => {
              const IconComponent = opt.icon ? iconMap[opt.icon] : null;
              return (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors ${
                    value === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={(e) => onChange(e.target.value)}
                    className="sr-only"
                  />
                  {IconComponent && (
                    <IconComponent
                      className={`h-8 w-8 ${
                        value === opt.value ? 'text-primary-600' : 'text-neutral-400'
                      }`}
                    />
                  )}
                  <div>
                    <div className="font-medium text-neutral-900">{opt.label}</div>
                    {opt.description && (
                      <div className="mt-1 text-xs text-neutral-500">{opt.description}</div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </FormFieldWrapper>
      );

    case 'checkbox-group':
      return (
        <FormFieldWrapper
          label={field.label}
          htmlFor={field.id}
          required={field.required}
          error={error}
          helpText={field.helpText}
        >
          <div className="space-y-2">
            {field.options?.map((opt) => {
              const currentValues = Array.isArray(value) ? value : [];
              const isChecked = currentValues.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isChecked
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...currentValues, opt.value]);
                      } else {
                        onChange(currentValues.filter((v: string) => v !== opt.value));
                      }
                    }}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-900">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </FormFieldWrapper>
      );

    default:
      return (
        <FormFieldWrapper
          label={field.label}
          htmlFor={field.id}
          required={field.required}
          error={error}
          helpText={field.helpText}
        >
          <Input
            id={field.id}
            placeholder={field.placeholder}
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            disabled={field.disabled}
          />
        </FormFieldWrapper>
      );
  }
}

export function FormEngine({
  schema,
  initialData = {},
  onSubmit,
  onSaveDraft,
  onCancel,
}: FormEngineProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Filter visible steps based on conditions
  const visibleSteps = useMemo(() => {
    return schema.steps.filter((step) => shouldShowStep(step, formData));
  }, [schema.steps, formData]);

  const currentStep = visibleSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  // Get fields for current step (used for validation)
  const currentFields = useMemo(() => {
    if (!currentStep) return [];
    const fields: FormField[] = [...(currentStep.fields || [])];
    if (currentStep.sections) {
      currentStep.sections.forEach((section) => {
        // Only include fields from visible sections
        if (shouldShowSection(section, formData)) {
          fields.push(...section.fields);
        }
      });
    }
    return fields.filter((field) => shouldShowField(field, formData));
  }, [currentStep, formData]);

  // Update field value
  const updateField = useCallback((fieldName: string, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev };
      set(next, fieldName, value);
      return next;
    });
    // Clear error when field is updated
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  // Validate current step
  const validateStep = useCallback(() => {
    const newErrors: Record<string, string> = {};

    currentFields.forEach((field) => {
      const value = get(formData, field.name);

      // Required validation
      if (field.required) {
        if (value === undefined || value === null || value === '') {
          newErrors[field.name] = `${field.label} is required`;
          return;
        }
        if (field.type === 'checkbox' && !value) {
          newErrors[field.name] = `You must accept this declaration`;
          return;
        }
      }

      // Pattern validation
      if (field.validation?.pattern && value) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(String(value))) {
          newErrors[field.name] =
            field.validation.patternMessage || `Invalid ${field.label.toLowerCase()}`;
        }
      }

      // Min validation for numbers
      if (field.validation?.min !== undefined && value !== undefined && value !== '') {
        if (Number(value) < field.validation.min) {
          newErrors[field.name] = `Minimum value is ${field.validation.min.toLocaleString()}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentFields, formData]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (!validateStep()) return;

    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateStep, isLastStep]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isFirstStep]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateStep, formData, onSubmit]);

  // Handle save draft
  const handleSaveDraft = useCallback(async () => {
    if (!onSaveDraft) return;

    setIsSavingDraft(true);
    try {
      await onSaveDraft(formData, currentStepIndex);
    } catch (error) {
      console.error('Save draft error:', error);
    } finally {
      setIsSavingDraft(false);
    }
  }, [formData, currentStepIndex, onSaveDraft]);

  if (!currentStep) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {visibleSteps.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      index < currentStepIndex
                        ? 'bg-primary-600 text-white'
                        : index === currentStepIndex
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`hidden whitespace-nowrap text-sm lg:block ${
                      index === currentStepIndex
                        ? 'font-medium text-neutral-900'
                        : 'text-neutral-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < visibleSteps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 flex-1 ${
                      index < currentStepIndex ? 'bg-primary-600' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          {currentStep.description && (
            <CardDescription>{currentStep.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {currentStep.sections ? (
              // Render sections with titles
              currentStep.sections.map((section) =>
                shouldShowSection(section, formData) ? (
                  <div key={section.id} className="space-y-4">
                    {section.title && (
                      <h3 className="border-b border-neutral-200 pb-2 text-lg font-semibold text-neutral-900">
                        {section.title}
                      </h3>
                    )}
                    {section.description && (
                      <p className="text-sm text-neutral-600">{section.description}</p>
                    )}
                    <div className="space-y-4">
                      {section.fields
                        .filter((field) => shouldShowField(field, formData))
                        .map((field) => (
                          <FieldRenderer
                            key={field.id}
                            field={field}
                            value={get(formData, field.name)}
                            onChange={(value) => updateField(field.name, value)}
                            error={errors[field.name]}
                          />
                        ))}
                    </div>
                  </div>
                ) : null
              )
            ) : (
              // Render flat fields (no sections)
              currentFields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={get(formData, field.name)}
                  onChange={(value) => updateField(field.name, value)}
                  error={errors[field.name]}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {!isFirstStep ? (
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          ) : onCancel ? (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
        <div className="flex gap-2">
          {onSaveDraft && (
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
            >
              {isSavingDraft && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Draft
            </Button>
          )}
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLastStep ? 'Submit Application' : 'Continue'}
            {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FormEngine;
