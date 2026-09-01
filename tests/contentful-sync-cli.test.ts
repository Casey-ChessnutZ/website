import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { runInteractiveSync } = require('../scripts/contentful-sync-cli-core.js') as {
  runInteractiveSync: (args: Record<string, unknown>) => Promise<string>;
};

test('exits without remote work when no content types are selected', async () => {
  const calls: string[] = [];
  const result = await runInteractiveSync({
    isTTY: true,
    registry: [{ id: 'event', label: 'Events' }],
    prompts: { select: async () => 'model', checkbox: async () => [], confirm: async () => true },
    runSelected: async () => calls.push('remote'),
  });

  assert.equal(result, 'cancelled');
  assert.deepEqual(calls, []);
});

test('runs only confirmed selections with the selected operation', async () => {
  const calls: Array<{ operation: string; selectedIds: string[] }> = [];
  const result = await runInteractiveSync({
    isTTY: true,
    registry: [{ id: 'event', label: 'Events' }, { id: 'news', label: 'News' }],
    prompts: { select: async () => 'data-update', checkbox: async () => ['event'], confirm: async () => true },
    runSelected: async (scope: { operation: string; selectedIds: string[] }) => calls.push(scope),
  });

  assert.equal(result, 'completed');
  assert.deepEqual(calls, [{ operation: 'data-update', selectedIds: ['event'] }]);
});

test('does not run remote work when the confirmation is declined', async () => {
  const calls: string[] = [];
  const result = await runInteractiveSync({
    isTTY: true,
    registry: [{ id: 'event', label: 'Events' }],
    prompts: { select: async () => 'model', checkbox: async () => ['event'], confirm: async () => false },
    runSelected: async () => calls.push('remote'),
  });

  assert.equal(result, 'cancelled');
  assert.deepEqual(calls, []);
});

test('requires a terminal for interactive sync', async () => {
  await assert.rejects(
    runInteractiveSync({ isTTY: false, registry: [], prompts: {}, runSelected: async () => undefined }),
    /requires a TTY/,
  );
});

test('exposes separate interactive and non-interactive Contentful commands', () => {
  const scripts = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts;

  assert.match(scripts['contentful:sync'], /contentful-sync-cli/);
  assert.match(scripts['contentful:sync:non-interactive'], /contentful-zero-touch/);
});
