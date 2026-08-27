import assert from 'node:assert/strict';
import test from 'node:test';

import { createContentfulRevalidationPlan } from '../app/lib/contentful/cache-revalidation.ts';

test('plans scoped cache and route invalidation for an event slug', () => {
  assert.deepEqual(
    createContentfulRevalidationPlan({
      sys: { contentType: { sys: { id: 'event' } } },
      fields: { slug: { 'en-US': '2026-open' } },
    }),
    {
      tags: ['contentful:event', 'contentful:event:2026-open'],
      paths: [
        { path: '/', type: 'page' },
        { path: '/events', type: 'page' },
        { path: '/events/2026-open', type: 'page' },
        { path: '/events/[slug]', type: 'page' },
      ],
    },
  );
});

test('plans collection and dynamic route invalidation for a slugless news deletion', () => {
  assert.deepEqual(
    createContentfulRevalidationPlan({
      sys: { contentType: { sys: { id: 'news' } } },
    }),
    {
      tags: ['contentful:news'],
      paths: [
        { path: '/news', type: 'page' },
        { path: '/news/[slug]', type: 'page' },
      ],
    },
  );
});

test('revalidates the photo album index and detail route', () => {
  assert.deepEqual(
    createContentfulRevalidationPlan({
      sys: { contentType: { sys: { id: 'photoAlbum' } } },
      fields: { slug: { 'en-US': 'spring-rapid-2026' } },
    }),
    {
      tags: ['contentful:photoAlbum', 'contentful:photoAlbum:spring-rapid-2026'],
      paths: [
        { path: '/album', type: 'page' },
        { path: '/album/spring-rapid-2026', type: 'page' },
        { path: '/album/[slug]', type: 'page' },
      ],
    },
  );
});

test('revalidates team routes when a person profile changes', () => {
  assert.deepEqual(
    createContentfulRevalidationPlan({
      sys: { contentType: { sys: { id: 'person' } } },
      fields: { slug: { 'en-US': 'alex-morgan' } },
    }),
    {
      tags: ['contentful:person', 'contentful:person:alex-morgan', 'contentful:event'],
      paths: [
        { path: '/', type: 'page' },
        { path: '/events', type: 'page' },
        { path: '/events/[slug]', type: 'page' },
        { path: '/team', type: 'page' },
        { path: '/team/alex-morgan', type: 'page' },
        { path: '/team/[slug]', type: 'page' },
      ],
    },
  );
});

test('does not create a plan for unsupported content types', () => {
  assert.equal(
    createContentfulRevalidationPlan({
      sys: { contentType: { sys: { id: 'author' } } },
    }),
    null,
  );
});
