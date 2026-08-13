import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveEventDivisions, resolveRelatedEvents } from '../app/lib/contentful/mapping.ts';

test('maps resolved event divisions', () => {
  const divisions = resolveEventDivisions(
    [{ sys: { id: 'rookies' } }],
    [{
      sys: { id: 'rookies' },
      fields: { title: 'Rookies', slug: '2026-koshnitsky-cup-rookies', format: 'Rapid Swiss' },
    }],
  );

  assert.deepEqual(divisions.map((division) => division.slug), ['2026-koshnitsky-cup-rookies']);
});

test('maps resolved related events in the editor-selected order', () => {
  assert.deepEqual(
    resolveRelatedEvents(
      [{ sys: { id: 'event-2025' } }],
      [{ sys: { id: 'event-2025' }, fields: { title: 'Melbourne Open 2025', slug: 'melbourne-open-2025', eventDate: '2025-11-15T00:00:00.000Z', format: 'Five-round Swiss' } }],
    ),
    [{ sys: { id: 'event-2025' }, title: 'Melbourne Open 2025', slug: 'melbourne-open-2025', summary: undefined, eventDate: '2025-11-15T00:00:00.000Z', status: undefined, format: 'Five-round Swiss', pairingUrl: undefined }],
  );
});
