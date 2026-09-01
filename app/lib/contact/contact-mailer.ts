import { Resend } from 'resend';

import { ContactSubmissionEmail } from '@/emails/contact-submission';
import type { ContactFormDefinition } from '@/app/lib/contentful/types';
import { getContactMailConfiguration } from './contact-mailer-config';

export type ContactMailOutcome = 'sent' | 'unavailable' | 'failed';

export async function sendContactSubmission(form: ContactFormDefinition, values: Record<string, string>): Promise<ContactMailOutcome> {
  const configuration = getContactMailConfiguration(form.recipientEmail);
  if (!configuration) return 'unavailable';

  try {
    const response = await new Resend(configuration.apiKey).emails.send({
      from: configuration.from,
      to: configuration.to,
      subject: `New ${form.title} submission`,
      replyTo: values.email || undefined,
      react: ContactSubmissionEmail({ form, values }),
    });
    return response.error ? 'failed' : 'sent';
  } catch {
    return 'failed';
  }
}
