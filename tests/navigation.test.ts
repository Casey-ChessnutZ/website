import assert from 'node:assert/strict';
import test from 'node:test';

import { getFooterNavigationGroups, getNavigationGroups, getPrimaryNavigation } from '../app/lib/navigation.ts';

test('uses the safe tournament navigation when no CMS navigation is configured', () => {
  assert.deepEqual(getPrimaryNavigation(), [
    { href: '/events', label: 'Tournaments', style: 'text' },
    { href: '/news', label: 'News', style: 'text' },
    { href: '/team', label: 'Our Team', style: 'text' },
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

test('normalizes enabled grouped navigation children and keeps internal routes only', () => {
  assert.deepEqual(
    getNavigationGroups({
      groups: [{ label: 'About', enabled: true, items: [
        { label: 'About Me', href: '/page/about-me', enabled: true },
        { label: 'Ignore', href: 'https://example.com', enabled: true },
      ] }],
    }),
    [{ label: 'About', items: [{ label: 'About Me', href: '/page/about-me' }] }],
  );
});

test('converts legacy flat items into one-link groups', () => {
  assert.deepEqual(
    getNavigationGroups({ items: [{ label: 'News', href: '/news', enabled: true, style: 'text' }] }),
    [{ label: 'News', href: '/news', items: [] }],
  );
});

test('uses the current footer groups when no footer CMS navigation is configured', () => {
  assert.deepEqual(getFooterNavigationGroups(), [
    {
      label: 'Explore',
      items: [
        { href: '/events', label: 'Tournaments' },
        { href: '/news', label: 'News' },
        { href: '/#about', label: 'About' },
      ],
    },
    {
      label: 'Information',
      items: [
        { href: '/contact', label: 'Contact' },
        { href: '/events', label: 'Event calendar' },
      ],
    },
  ]);
});

test('uses enabled footer CMS groups independently of the header navigation', () => {
  assert.deepEqual(
    getFooterNavigationGroups({
      groups: [{ label: 'Support', enabled: true, items: [{ label: 'Help', href: '/help', enabled: true }] }],
    }),
    [{ label: 'Support', items: [{ href: '/help', label: 'Help' }] }],
  );
});
