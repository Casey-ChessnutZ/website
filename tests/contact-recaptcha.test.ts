import assert from 'node:assert/strict';
import test from 'node:test';

import { verifyContactRecaptcha } from '../app/lib/contact/contact-recaptcha.ts';

test('accepts a successful contact_submit reCAPTCHA score', async () => {
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.RECAPTCHA_SECRET_KEY;
  process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
  globalThis.fetch = async () => new Response(JSON.stringify({ success: true, score: 0.9, action: 'contact_submit' }));

  try {
    assert.equal(await verifyContactRecaptcha('fresh-token'), true);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.RECAPTCHA_SECRET_KEY;
    else process.env.RECAPTCHA_SECRET_KEY = originalSecret;
  }
});

test('rejects a token verified for a different action', async () => {
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.RECAPTCHA_SECRET_KEY;
  process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
  globalThis.fetch = async () => new Response(JSON.stringify({ success: true, score: 0.9, action: 'newsletter_signup' }));

  try {
    assert.equal(await verifyContactRecaptcha('fresh-token'), false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.RECAPTCHA_SECRET_KEY;
    else process.env.RECAPTCHA_SECRET_KEY = originalSecret;
  }
});
