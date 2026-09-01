import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { isContentTypeSelected, isContentTypeUpdateEnabled } = require('../scripts/contentful-upsert-policy.js') as {
  isContentTypeSelected: (contentType: string, environment?: NodeJS.ProcessEnv) => boolean;
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

test('selects only explicitly chosen content types when a sync scope is present', () => {
  const environment = { CONTENTFUL_SYNC_CONTENT_TYPES: 'event, siteSettings' };

  assert.equal(isContentTypeSelected('event', environment), true);
  assert.equal(isContentTypeSelected('siteSettings', environment), true);
  assert.equal(isContentTypeSelected('news', environment), false);
});
