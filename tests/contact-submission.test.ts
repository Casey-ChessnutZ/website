import assert from 'node:assert/strict';
import test from 'node:test';

import { validateContactSubmission } from '../app/lib/contact/contact-submission.ts';

const form = {
  title: 'Contact', intro: '', successMessage: 'Thanks',
  fields: [
    { id: 'email', label: 'Email', type: 'email' as const, required: true },
    { id: 'message', label: 'Message', type: 'textarea' as const, required: true },
  ],
};

test('rejects a missing required CMS field', () => {
  assert.deepEqual(validateContactSubmission(form, { email: 'person@example.com' }), { error: 'Message is required.' });
});

test('rejects an invalid email before delivery', () => {
  assert.deepEqual(validateContactSubmission(form, { email: 'not-an-email', message: 'Hello' }), { error: 'Enter a valid email address.' });
});

test('returns only values declared by the form', () => {
  assert.deepEqual(validateContactSubmission(form, { email: 'person@example.com', message: 'Hello', injected: 'ignore' }), { values: { email: 'person@example.com', message: 'Hello' } });
});
