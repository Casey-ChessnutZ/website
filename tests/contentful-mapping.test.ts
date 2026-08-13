import assert from 'node:assert/strict';
import test from 'node:test';

import { formatAssetSize, getAssetTypeLabel, normalizeLocation, normalizeScheduleItems, resolveLinkedAsset, richTextToPlainText } from '../app/lib/contentful/mapping.ts';

test('resolves a home hero image link from Contentful includes', () => {
  assert.equal(resolveLinkedAsset({ sys: { id: 'asset-hero', type: 'Link', linkType: 'Asset' } }, [{ sys: { id: 'asset-hero' }, fields: { title: 'Hero image', file: { url: '//images.ctfassets.net/hero.webp' } } }])?.url, 'https://images.ctfassets.net/hero.webp');
});

test('converts a rich text homepage field to readable copy', () => {
  assert.equal(richTextToPlainText({ nodeType: 'document', content: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'Play in good company.' }] }] }), 'Play in good company.');
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

test('formats attachment type and file size for an event document card', () => {
  assert.equal(getAssetTypeLabel('application/pdf'), 'PDF');
  assert.equal(getAssetTypeLabel('video/mp4'), 'Video');
  assert.equal(formatAssetSize(1_572_864), '1.5 MB');
});
