export type ContactDraft = { name: string; email: string; subject: string; message: string };

export function validateContactDraft(draft: ContactDraft): Partial<Record<keyof ContactDraft, string>> {
  const errors: Partial<Record<keyof ContactDraft, string>> = {};

  if (!draft.name.trim()) errors.name = 'Enter your name.';
  if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) errors.email = 'Enter a valid email address.';
  if (!draft.subject.trim()) errors.subject = 'Enter a subject.';
  if (!draft.message.trim()) errors.message = 'Enter a message.';

  return errors;
}
