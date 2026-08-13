import assert from 'node:assert/strict';
import test from 'node:test';

import { getEventCalendarYear, getEventCalendarYears, filterEventsByCalendarYear } from '../app/components/events/event-calendar-data.ts';

const events = [
  { sys: { id: '2026' }, title: 'Melbourne Open 2026', slug: 'melbourne-open-2026', eventDate: '2026-11-14T10:00:00.000Z' },
  { sys: { id: '2025' }, title: 'Melbourne Open 2025', slug: 'melbourne-open-2025', eventDate: '2025-11-15T10:00:00.000Z' },
];

test('derives an event year in the Melbourne timezone', () => {
  assert.equal(getEventCalendarYear('2026-01-01T00:30:00.000Z'), 2026);
  assert.equal(getEventCalendarYear(undefined), undefined);
});

test('lists available event years newest first', () => {
  assert.deepEqual(getEventCalendarYears(events), [2026, 2025]);
});

test('filters the calendar to the selected year', () => {
  assert.deepEqual(filterEventsByCalendarYear(events, 2025), [events[1]]);
});
