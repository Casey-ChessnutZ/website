import assert from 'node:assert/strict';
import test from 'node:test';

import { formatEventDate } from '../app/lib/formatting/date.ts';

test('formats Contentful event timestamps as a friendly Melbourne date', () => {
  assert.equal(formatEventDate('2026-11-14T10:00:00.000Z'), 'Sat 14 November 2026');
});

test('returns no label for an invalid event timestamp', () => {
  assert.equal(formatEventDate('not-a-date'), undefined);
});
