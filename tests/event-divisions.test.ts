import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveEventDivisions } from '../app/lib/contentful/mapping.ts';

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
