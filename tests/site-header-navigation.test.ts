import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('header exposes a menu button for navigation groups with children', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'app/components/shared/site-header.tsx'), 'utf8');

  assert.match(source, /aria-haspopup="menu"/);
  assert.match(source, /aria-expanded=/);
  assert.match(source, /onKeyDown/);
  assert.match(source, /onMouseEnter/);
  assert.match(source, /transition-\[opacity,transform\]/);
  assert.match(source, /-translate-y-1/);
  assert.match(source, /md:absolute/);
  assert.match(source, /src="\/logo\.png"/);
  assert.match(source, /h-16 w-48 overflow-hidden/);
  assert.doesNotMatch(source, /-my-8/);
  assert.match(source, /border-r border-b border-current/);
  assert.doesNotMatch(source, />⌄</);
});

test('site layout supplies normalized navigation groups to the shared header', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'app/(site)/layout.tsx'), 'utf8');

  assert.match(source, /getNavigationGroups/);
});
