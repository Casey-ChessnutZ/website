import type { ContactFormDefinition } from '@/app/lib/contentful/types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactSubmissionValidation =
  | { values: Record<string, string> }
  | { error: string };

export function validateContactSubmission(form: ContactFormDefinition, payload: unknown): ContactSubmissionValidation {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { error: 'Invalid form submission.' };

  const source = payload as Record<string, unknown>;
  const values: Record<string, string> = {};

  for (const field of form.fields) {
    const rawValue = source[field.id];
    const value = typeof rawValue === 'string' ? rawValue.trim() : '';
    if (field.required && !value) return { error: `${field.label} is required.` };
    if (field.type === 'email' && value && !emailPattern.test(value)) return { error: 'Enter a valid email address.' };
    if (field.type === 'select' && value && !field.options?.includes(value)) return { error: `Choose a valid ${field.label.toLowerCase()}.` };
    if (value.length > 5000) return { error: `${field.label} is too long.` };
    values[field.id] = value;
  }

  return { values };
}
