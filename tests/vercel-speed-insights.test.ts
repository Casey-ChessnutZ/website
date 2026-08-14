import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('root layout renders Vercel Speed Insights once', () => {
  const layout = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8');
  assert.match(layout, /from '@vercel\/speed-insights\/next'/);
  assert.match(layout, /<SpeedInsights\s*\/>/);
});
