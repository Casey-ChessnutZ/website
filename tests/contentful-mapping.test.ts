import assert from 'node:assert/strict';
import test from 'node:test';

import { mergeSectionBlockFields, normalizeLocation, normalizeScheduleItems, richTextToPlainText } from '../app/lib/contentful/mapping.ts';

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

test('keeps complete structured event schedule items and ignores malformed items', () => {
  assert.deepEqual(
    normalizeScheduleItems({ items: [{ time: 'Saturday · 10:00am', title: 'Round 1', detail: 'Main hall' }, { time: 10, title: 'Invalid' }] }),
    [{ time: 'Saturday · 10:00am', title: 'Round 1', detail: 'Main hall' }],
  );
});

test('keeps valid Contentful location coordinates and ignores malformed values', () => {
  assert.deepEqual(normalizeLocation({ lat: -37.8108, lon: 144.9655 }), { lat: -37.8108, lon: 144.9655 });
  assert.equal(normalizeLocation({ lat: 'invalid', lon: 144.9655 }), undefined);
});
