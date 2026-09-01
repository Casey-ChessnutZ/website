export type ContactMailConfiguration = { apiKey: string; from: string; to: string };

export function getContactMailConfiguration(recipientEmail: string | undefined, environment = process.env): ContactMailConfiguration | null {
  const apiKey = environment.RESEND_API_KEY;
  const from = environment.CONTACT_EMAIL_FROM;
  const to = recipientEmail;
  return apiKey && from && to ? { apiKey, from, to } : null;
}
