import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('uses the supplied logo in the shared header', () => {
  const header = fs.readFileSync(path.join(process.cwd(), 'app/components/shared/site-header.tsx'), 'utf8');

  assert.match(header, /src="\/logo\.png"/);
});

test('uses the supplied logo with dark-background contrast in the shared footer', () => {
  const footer = fs.readFileSync(path.join(process.cwd(), 'app/components/shared/site-footer.tsx'), 'utf8');

  assert.match(footer, /src="\/logo\.png"/);
  assert.match(footer, /invert/);
});
