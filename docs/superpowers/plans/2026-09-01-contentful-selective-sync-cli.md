# Contentful Selective Sync CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an interactive, multi-select Contentful sync CLI that limits remote model/editor and seed operations to explicitly selected content types.

**Architecture:** A registry describes every selectable content type and its independent model/editor and seed handlers. A small Inquirer CLI owns terminal interaction, dry-run scope output, confirmation, and handler invocation. The existing zero-touch script exports reusable Contentful operations and remains available for non-interactive automation.

**Tech Stack:** Node.js, CommonJS, `@inquirer/prompts`, Contentful Management API, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-01-contentful-selective-sync-cli-design.md`

## Global Constraints

- Use `@inquirer/prompts` and its `checkbox()` prompt for multi-selection.
- Interactive mode must require a TTY; non-interactive callers use explicit flags.
- Never call a handler for an unselected content type.
- Require confirmation after displaying the selected operation and content types.
- Create-missing seed mode never overwrites an existing entry.
- Update-existing seed mode still requires `CONTENTFUL_UPSERT_CONTENT_TYPES`.
- Legacy cleanup remains out of the interactive menu.
- Do not commit changes unless the user explicitly asks.

---

### Task 1: Install the interactive prompt dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `@inquirer/prompts` available to `scripts/contentful-sync-cli.js`.

- [ ] **Step 1: Add the production dependency**

Run:

```bash
npm install @inquirer/prompts
```

- [ ] **Step 2: Verify the dependency is resolvable**

Run:

```bash
node -e "import('@inquirer/prompts').then(({ checkbox, confirm, select }) => { if (!checkbox || !confirm || !select) process.exit(1); })"
```

Expected: exit code `0`.

### Task 2: Define the selectable sync registry

**Files:**
- Create: `scripts/contentful-sync-registry.js`
- Test: `tests/contentful-sync-registry.test.ts`

**Interfaces:**
- Produces: `getSyncRegistry()` returning `{ id, label, schemaFile?, configureEditor?, seed? }[]`.
- Consumes: exported Contentful operations from `scripts/contentful-zero-touch.js`.

- [ ] **Step 1: Write the failing registry tests**

```ts
test('lists Site Settings as a selectable model and editor target', () => {
  const settings = getSyncRegistry().find((item) => item.id === 'siteSettings');
  assert.equal(settings?.label, 'Site Settings');
  assert.equal(typeof settings?.modelAndEditor, 'function');
});

test('does not expose legacy cleanup as a selectable target', () => {
  assert.equal(getSyncRegistry().some((item) => item.id === 'sectionBlock'), false);
});
```

- [ ] **Step 2: Run the registry tests to verify they fail**

Run:

```bash
node --experimental-strip-types --test tests/contentful-sync-registry.test.ts
```

Expected: fail because `getSyncRegistry` does not exist.

- [ ] **Step 3: Add the registry with explicit model/editor and seed boundaries**

```js
function getSyncRegistry() {
  return [
    {
      id: 'siteSettings',
      label: 'Site Settings',
      modelAndEditor: syncSiteSettingsModelAndEditor,
      seed: seedSiteSettings,
    },
    {
      id: 'event',
      label: 'Events',
      modelAndEditor: syncEventModelAndEditor,
      seed: seedEvents,
    },
  ];
}

module.exports = { getSyncRegistry };
```

Include every existing supported content type with a current schema or seed handler. Do not include `sectionBlock` cleanup.

- [ ] **Step 4: Run the registry tests to verify they pass**

Run:

```bash
node --experimental-strip-types --test tests/contentful-sync-registry.test.ts
```

Expected: all registry tests pass.

### Task 3: Extract reusable scoped Contentful operations

**Files:**
- Modify: `scripts/contentful-zero-touch.js`
- Test: `tests/contentful-sync-registry.test.ts`

**Interfaces:**
- Produces: `createContentfulClient()`, `syncContentType(schemaFile)`, and named model/editor and seed functions used by the registry.
- Consumes: current `upsertContentType`, editor configuration, `upsertEntryBySlug`, `upsertSingleEntry`, and `isContentTypeUpdateEnabled` behavior.

- [ ] **Step 1: Extend the failing registry tests with scoped handler execution**

```ts
test('runs only the selected registry handler', async () => {
  const calls: string[] = [];
  await runSelectedHandlers({
    selectedIds: ['siteSettings'],
    registry: [
      { id: 'siteSettings', modelAndEditor: async () => calls.push('siteSettings') },
      { id: 'event', modelAndEditor: async () => calls.push('event') },
    ],
    operation: 'model-and-editor',
  });
  assert.deepEqual(calls, ['siteSettings']);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --experimental-strip-types --test tests/contentful-sync-registry.test.ts
```

Expected: fail because `runSelectedHandlers` does not exist.

- [ ] **Step 3: Export scoped operations without changing their update policy**

```js
async function runSelectedHandlers({ selectedIds, registry, operation, context }) {
  for (const item of registry.filter((candidate) => selectedIds.includes(candidate.id))) {
    const handler = operation === 'model-and-editor' ? item.modelAndEditor : item[operation];
    if (handler) await handler(context);
  }
}
```

Keep `CONTENTFUL_UPSERT_CONTENT_TYPES` checks in seed-update handlers. Keep the Site Settings handler limited to schema/editor work unless a seed operation was selected.

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
node --experimental-strip-types --test tests/contentful-sync-registry.test.ts
```

Expected: all registry tests pass and no unselected handler executes.

### Task 4: Build and test the Inquirer CLI flow

**Files:**
- Create: `scripts/contentful-sync-cli.js`
- Create: `scripts/contentful-sync-cli-core.js`
- Test: `tests/contentful-sync-cli.test.ts`

**Interfaces:**
- Produces: `runInteractiveSync({ prompts, registry, isTTY, createContext })` and executable CLI entrypoint.
- Consumes: `select`, `checkbox`, and `confirm` from `@inquirer/prompts`; registry and selected-handler runner.

- [ ] **Step 1: Write failing CLI-core tests using injected prompts**

```ts
test('exits without remote work when no content types are selected', async () => {
  const calls: string[] = [];
  const result = await runInteractiveSync({
    isTTY: true,
    registry: [{ id: 'event', label: 'Events' }],
    prompts: { select: async () => 'model-and-editor', checkbox: async () => [], confirm: async () => true },
    runSelectedHandlers: async () => calls.push('remote'),
  });
  assert.equal(result, 'cancelled');
  assert.deepEqual(calls, []);
});

test('summarizes and runs only confirmed selections', async () => {
  const calls: string[] = [];
  await runInteractiveSync({
    isTTY: true,
    registry: [{ id: 'event', label: 'Events' }],
    prompts: { select: async () => 'model-and-editor', checkbox: async () => ['event'], confirm: async () => true },
    runSelectedHandlers: async ({ selectedIds }) => calls.push(...selectedIds),
  });
  assert.deepEqual(calls, ['event']);
});
```

- [ ] **Step 2: Run the CLI-core tests to verify they fail**

Run:

```bash
node --experimental-strip-types --test tests/contentful-sync-cli.test.ts
```

Expected: fail because `runInteractiveSync` does not exist.

- [ ] **Step 3: Implement the pure CLI coordinator and terminal entrypoint**

```js
async function runInteractiveSync({ isTTY, prompts, registry, runSelectedHandlers, createContext }) {
  if (!isTTY) throw new Error('Interactive Contentful sync requires a TTY. Use explicit non-interactive flags in CI.');
  const operation = await prompts.select({ message: 'Choose Contentful operation', choices: operationChoices });
  const selectedIds = await prompts.checkbox({ message: 'Select content types', choices: registry.map(({ id, label }) => ({ name: label, value: id })) });
  if (!selectedIds.length) return 'cancelled';
  const confirmed = await prompts.confirm({ message: `Apply ${operation} to ${selectedIds.join(', ')}?`, default: false });
  if (!confirmed) return 'cancelled';
  await runSelectedHandlers({ selectedIds, registry, operation, context: await createContext() });
  return 'completed';
}
```

The entrypoint dynamically imports `@inquirer/prompts`, passes real terminal prompts, and exits non-zero on errors.

- [ ] **Step 4: Run the CLI-core tests to verify they pass**

Run:

```bash
node --experimental-strip-types --test tests/contentful-sync-cli.test.ts
```

Expected: all prompt outcomes are covered without making network calls.

### Task 5: Wire commands, compatibility mode, and documentation

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Modify: `scripts/contentful-zero-touch.js`
- Test: `tests/contentful-sync-cli.test.ts`

**Interfaces:**
- Produces: `npm run contentful:sync` interactive command and `npm run contentful:sync:non-interactive` compatibility command.

- [ ] **Step 1: Add failing command-contract tests**

```ts
test('exposes separate interactive and non-interactive Contentful commands', () => {
  const scripts = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts;
  assert.match(scripts['contentful:sync'], /contentful-sync-cli/);
  assert.match(scripts['contentful:sync:non-interactive'], /contentful-zero-touch/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --experimental-strip-types --test tests/contentful-sync-cli.test.ts
```

Expected: fail because the command split does not exist.

- [ ] **Step 3: Update the commands and README**

```json
{
  "contentful:sync": "node scripts/contentful-sync-cli.js",
  "contentful:sync:non-interactive": "node scripts/contentful-zero-touch.js"
}
```

Document keyboard controls, operation definitions, confirmation behavior,
the non-interactive command, `CONTENTFUL_UPSERT_CONTENT_TYPES`, and the fact
that legacy cleanup is deliberately not selectable.

- [ ] **Step 4: Run the command-contract test to verify it passes**

Run:

```bash
node --experimental-strip-types --test tests/contentful-sync-cli.test.ts
```

Expected: the interactive command and compatibility command are both present.

### Task 6: Full verification and manual dry run

**Files:**
- Verify: all modified files

- [ ] **Step 1: Run the complete local verification suite**

Run:

```bash
npm run verify:isolated
```

Expected: tests, lint, and isolated production build pass.

- [ ] **Step 2: Run an interactive dry run**

Run:

```bash
npm run contentful:sync
```

Select one model/editor target, inspect the displayed scope, and decline the
confirmation. Expected: the process exits without a Contentful write.

- [ ] **Step 3: Confirm workspace state**

Run:

```bash
git diff --check && git status --short
```

Expected: no whitespace errors; report the exact changed files and leave them
uncommitted unless the user asks otherwise.
