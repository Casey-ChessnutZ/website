import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { createContentfulRevalidationPlan } from '../app/lib/contentful/cache-revalidation.ts';

test('revalidates the scoped generic content page route', () => {
  assert.deepEqual(
    createContentfulRevalidationPlan({ sys: { contentType: { sys: { id: 'page' } } }, fields: { slug: { 'en-US': 'privacy' } } }),
    { tags: ['contentful:page', 'contentful:page:privacy'], paths: [{ path: '/page/privacy', type: 'page' }, { path: '/page/[slug]', type: 'page' }] },
  );
});

test('page schema has only simple editorial fields', () => {
  const schema = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content-model/schemas/page.schema.json'), 'utf8'));
  assert.deepEqual(schema.fields.map((field: { id: string }) => field.id), ['title', 'slug', 'summary', 'content', 'seoTitle', 'seoDescription']);
});
