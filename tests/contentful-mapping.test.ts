import assert from 'node:assert/strict';
import test from 'node:test';

import { mergeSectionBlockFields, richTextToPlainText } from '../app/lib/contentful/mapping.ts';

test('merges structured block content into renderer fields', () => {
  assert.deepEqual(
    mergeSectionBlockFields({ headline: 'Formats', content: { cards: [{ title: 'Rapid' }] } }),
    { headline: 'Formats', cards: [{ title: 'Rapid' }] },
  );
});

test('converts Contentful rich text to readable event copy', () => {
  assert.equal(
    richTextToPlainText({ nodeType: 'document', content: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'First round starts at 10am.' }] }] }),
    'First round starts at 10am.',
  );
});
