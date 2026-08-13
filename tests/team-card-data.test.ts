import assert from 'node:assert/strict';
import test from 'node:test';

import { getTeamMemberMeta } from '../app/components/team/team-card-data.ts';

test('uses a useful fallback when a team member has no federation or location', () => {
  assert.equal(getTeamMemberMeta({}), 'ChessNutZ team');
});

test('joins a team member federation and location for scanning', () => {
  assert.equal(getTeamMemberMeta({ federation: 'Australia', location: 'Melbourne' }), 'Australia · Melbourne');
});
