import assert from 'node:assert/strict';
import test from 'node:test';

import { toRichTextDocument } from '../app/lib/contentful/mapping.ts';

test('preserves a Contentful Rich Text document for the official renderer', () => {
  const document = { nodeType: 'document', data: {}, content: [
      { nodeType: 'heading-2', content: [{ nodeType: 'text', value: 'Round one' }] },
      { nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'Check-in opens at 9am.' }] },
    ] };

  assert.equal(toRichTextDocument(document), document);
});
