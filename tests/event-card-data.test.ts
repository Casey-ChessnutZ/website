import assert from 'node:assert/strict';
import test from 'node:test';

import { getEventCardDate } from '../app/components/events/event-card-data.ts';

test('turns a Contentful timestamp into compact Melbourne date-card data', () => {
  assert.deepEqual(getEventCardDate('2026-11-13T13:00:00.000Z'), {
    day: '14',
    month: 'NOV',
    label: 'Sat 14 November 2026',
  });
});

test('uses a readable fallback when an event date is unavailable', () => {
  assert.equal(getEventCardDate(undefined), null);
});
