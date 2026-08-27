import { NextResponse } from 'next/server';
import { getContactForm } from '@/app/lib/contentful/queries';
import { sendContactSubmission } from '@/app/lib/contact/contact-mailer';
import { validateContactSubmission } from '@/app/lib/contact/contact-submission';

const requestTimes = new Map<string, number[]>();

export async function POST(request: Request) {
  const now = Date.now();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const recent = (requestTimes.get(ip) ?? []).filter((time) => now - time < 600000);
  if (recent.length >= 5) return NextResponse.json({ error: 'Please wait before sending another message.' }, { status: 429 });
  requestTimes.set(ip, [...recent, now]);
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 });
  if ((payload as Record<string, unknown>).website) return NextResponse.json({ successMessage: 'Thanks — your message has been sent.' });
  const form = await getContactForm();
  if (!form) return NextResponse.json({ error: 'Contact form is unavailable right now.' }, { status: 503 });
  const validation = validateContactSubmission(form, payload);
  if ('error' in validation) return NextResponse.json(validation, { status: 400 });
  const outcome = await sendContactSubmission(form, validation.values);
  if (outcome === 'unavailable') return NextResponse.json({ error: 'Contact email is not configured yet.' }, { status: 503 });
  if (outcome === 'failed') return NextResponse.json({ error: 'We could not send your message. Please try again.' }, { status: 502 });
  return NextResponse.json({ successMessage: form.successMessage });
}
