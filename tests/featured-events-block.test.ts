import assert from 'node:assert/strict';
import test from 'node:test';

import { getFeaturedEventIndex } from '../app/components/content/featured-events-data.ts';

test('uses the first featured event as the lead and keeps remaining events in order', () => {
  const events = [
    { sys: { id: 'one' }, slug: 'melbourne-open', title: 'Melbourne Open' },
    { sys: { id: 'two' }, slug: 'spring-rapid', title: 'Spring Rapid' },
  ];

  assert.deepEqual(getFeaturedEventIndex(events), { lead: events[0], remaining: [events[1]] });
});
