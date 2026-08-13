import assert from 'node:assert/strict';
import test from 'node:test';

import { getPrimaryNavigation } from '../app/lib/navigation.ts';

test('uses the safe tournament navigation when no CMS navigation is configured', () => {
  assert.deepEqual(getPrimaryNavigation(), [
    { href: '/events', label: 'Tournaments', style: 'text' },
    { href: '/news', label: 'News', style: 'text' },
    { href: '/#about', label: 'About', style: 'text' },
    { href: '/events', label: 'Find an event', style: 'primary' },
  ]);
});

test('keeps only enabled CMS links with valid labels and paths', () => {
  assert.deepEqual(
    getPrimaryNavigation([
      { label: 'Calendar', href: '/events', style: 'text', enabled: true },
      { label: '', href: '/invalid', style: 'primary', enabled: true },
      { label: 'Hidden', href: '/hidden', style: 'text', enabled: false },
    ]),
    [{ href: '/events', label: 'Calendar', style: 'text' }],
  );
});
