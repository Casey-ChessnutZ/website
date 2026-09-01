import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { isContentTypeUpdateEnabled } = require('../scripts/contentful-upsert-policy.js') as {
  isContentTypeUpdateEnabled: (contentType: string, environment?: NodeJS.ProcessEnv) => boolean;
};

test('does not update editor-managed content types by default', () => {
  assert.equal(isContentTypeUpdateEnabled('contactForm', {}), false);
});

test('updates only content types explicitly enabled in the allow-list', () => {
  const environment = { CONTENTFUL_UPSERT_CONTENT_TYPES: 'event, contactForm' };
  assert.equal(isContentTypeUpdateEnabled('contactForm', environment), true);
  assert.equal(isContentTypeUpdateEnabled('siteSettings', environment), false);
});
