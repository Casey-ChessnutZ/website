import assert from 'node:assert/strict';
import test from 'node:test';

import { validateContactDraft } from '../app/components/contact/contact-form-utils.ts';

test('requires contact details before a draft can be saved', () => {
  assert.deepEqual(
    validateContactDraft({ name: '', email: 'invalid', subject: '', message: '' }),
    { name: 'Enter your name.', email: 'Enter a valid email address.', subject: 'Enter a subject.', message: 'Enter a message.' },
  );
});

test('accepts a complete contact draft', () => {
  assert.deepEqual(
    validateContactDraft({ name: 'Alex', email: 'alex@example.com', subject: 'Venue access', message: 'Is the venue accessible?' }),
    {},
  );
});
