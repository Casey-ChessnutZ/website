import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getSyncRegistry } = require('../scripts/contentful-sync-registry.js') as {
  getSyncRegistry: () => Array<{ id: string; label: string }>;
};

test('lists Site Settings as a selectable sync target', () => {
  assert.deepEqual(
    getSyncRegistry().find((item) => item.id === 'siteSettings'),
    { id: 'siteSettings', label: 'Site Settings' },
  );
});

test('does not expose legacy cleanup as a selectable target', () => {
  assert.equal(getSyncRegistry().some((item) => item.id === 'sectionBlock'), false);
});
