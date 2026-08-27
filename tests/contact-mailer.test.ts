import assert from 'node:assert/strict';
import test from 'node:test';

import { getContactMailConfiguration } from '../app/lib/contact/contact-mailer-config.ts';

test('reports unavailable without the complete mail configuration', async () => {
  const original = { apiKey: process.env.RESEND_API_KEY, from: process.env.CONTACT_EMAIL_FROM, to: process.env.CONTACT_EMAIL_TO };
  process.env.RESEND_API_KEY = '';
  process.env.CONTACT_EMAIL_FROM = '';
  process.env.CONTACT_EMAIL_TO = '';

  try {
    assert.equal(getContactMailConfiguration(), null);
  } finally {
    process.env.RESEND_API_KEY = original.apiKey;
    process.env.CONTACT_EMAIL_FROM = original.from;
    process.env.CONTACT_EMAIL_TO = original.to;
  }
});
