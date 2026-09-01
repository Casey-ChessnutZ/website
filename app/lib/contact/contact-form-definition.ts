import type { ContactFieldDefinition, ContactFieldType, ContactFormDefinition } from '@/app/lib/contentful/types';

const fieldTypes: ContactFieldType[] = ['text', 'email', 'tel', 'select', 'textarea'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmedString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function mapContactFormItem(item: { fields?: Record<string, unknown> }): ContactFormDefinition {
  const fields = item.fields ?? {};
  const fieldDefinitions = fields.fieldDefinitions;
  const formFields = fieldDefinitions && typeof fieldDefinitions === 'object' && !Array.isArray(fieldDefinitions) && Array.isArray((fieldDefinitions as Record<string, unknown>).items)
    ? (fieldDefinitions as Record<string, unknown>).items as unknown[]
    : Array.isArray(fields.fields) ? fields.fields : [];

  return {
    title: asTrimmedString(fields.title) ?? 'Contact us',
    intro: asTrimmedString(fields.intro) ?? '',
    successMessage: asTrimmedString(fields.successMessage) ?? 'Thanks — your message has been sent.',
    ...(asTrimmedString(fields.recipientEmail) && emailPattern.test(asTrimmedString(fields.recipientEmail)!) ? { recipientEmail: asTrimmedString(fields.recipientEmail)! } : {}),
    fields: formFields.flatMap((field): ContactFieldDefinition[] => {
      if (!field || typeof field !== 'object' || Array.isArray(field)) return [];
      const value = field as Record<string, unknown>;
      const id = asTrimmedString(value.id);
      const label = asTrimmedString(value.label);
      const type = value.type;
      if (!id || !label || !fieldTypes.includes(type as ContactFieldType)) return [];

      const options = Array.isArray(value.options)
        ? value.options.flatMap((option) => asTrimmedString(option) ? [asTrimmedString(option)!] : [])
        : undefined;

      return [{
        id,
        label,
        type: type as ContactFieldType,
        required: value.required === true,
        ...(asTrimmedString(value.placeholder) ? { placeholder: asTrimmedString(value.placeholder) } : {}),
        ...(asTrimmedString(value.helpText) ? { helpText: asTrimmedString(value.helpText) } : {}),
        ...(type === 'select' && options?.length ? { options } : {}),
      }];
    }),
  };
}
