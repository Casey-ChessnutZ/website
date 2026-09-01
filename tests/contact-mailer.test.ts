import assert from 'node:assert/strict';
import test from 'node:test';

import { getContactMailConfiguration } from '../app/lib/contact/contact-mailer-config.ts';

test('reports unavailable without the complete mail configuration', async () => {
  const original = { apiKey: process.env.RESEND_API_KEY, from: process.env.CONTACT_EMAIL_FROM };
  process.env.RESEND_API_KEY = '';
  process.env.CONTACT_EMAIL_FROM = '';

  try {
    assert.equal(getContactMailConfiguration('organiser@example.com'), null);
  } finally {
    process.env.RESEND_API_KEY = original.apiKey;
    process.env.CONTACT_EMAIL_FROM = original.from;
  }
});

test('uses the recipient configured on the contact form instead of an environment variable', () => {
  assert.deepEqual(
    getContactMailConfiguration('organiser@example.com', { RESEND_API_KEY: 'test-key', CONTACT_EMAIL_FROM: 'website@example.com' }),
    { apiKey: 'test-key', from: 'website@example.com', to: 'organiser@example.com' },
  );
});
