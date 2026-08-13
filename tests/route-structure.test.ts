import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

test('keeps the site route group as the sole owner of the home route', () => {
  assert.equal(existsSync(resolve(process.cwd(), 'app/page.tsx')), false);
  assert.equal(existsSync(resolve(process.cwd(), 'app/(site)/page.tsx')), true);
});
