import assert from 'node:assert/strict';
import test from 'node:test';

import { getContactRecaptchaToken } from '../app/components/contact/contact-recaptcha.ts';

test('requests a fresh token for the contact_submit action', async () => {
  let requestedAction: string | undefined;
  const token = await getContactRecaptchaToken({
    ready(callback) {
      callback();
    },
    execute(_siteKey, options) {
      requestedAction = options.action;
      return Promise.resolve('fresh-token');
    },
  }, 'public-site-key');

  assert.equal(token, 'fresh-token');
  assert.equal(requestedAction, 'contact_submit');
});
