export type ContactMailConfiguration = { apiKey: string; from: string; to: string };

export function getContactMailConfiguration(environment = process.env): ContactMailConfiguration | null {
  const apiKey = environment.RESEND_API_KEY;
  const from = environment.CONTACT_EMAIL_FROM;
  const to = environment.CONTACT_EMAIL_TO;
  return apiKey && from && to ? { apiKey, from, to } : null;
}
