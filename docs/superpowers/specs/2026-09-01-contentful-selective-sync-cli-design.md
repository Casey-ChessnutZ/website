# Contentful Selective Sync CLI Design

## Goal

Replace the all-or-nothing local Contentful sync workflow with an interactive
CLI that scopes remote changes to selected content types and operations.

## User flow

`npm run contentful:sync` starts an interactive terminal session when stdin is
a TTY. The CLI uses `@inquirer/prompts`:

1. Select an operation: **model and editor sync**, **create missing seed
   entries**, or **update existing seed entries**.
2. Select one or more supported content types with a checkbox prompt.
3. Display the exact operation and selected types.
4. Require a final confirmation before connecting to Contentful.

If stdin is not interactive, the command fails with a clear instruction to use
the explicit non-interactive flags. This keeps CI deterministic.

## Scope and safety

Each content type is registered with independent handlers for model/editor and
seed operations. The CLI never executes unselected handlers.

Model operations update only the selected content type schema and its related
editor configuration. A focused field operation, such as the existing Site
Settings footer navigation control, remains available as a handler within the
Site Settings model action.

`create missing seed entries` never overwrites an existing entry. `update
existing seed entries` requires both an interactive confirmation and the
existing `CONTENTFUL_UPSERT_CONTENT_TYPES` allow-list. Content type deletion
and legacy cleanup remain outside the interactive menu and require their own
explicit command and confirmation.

No operation modifies a Contentful entry unless the selected operation is a
seed operation and its relevant update conditions are met.

## Components

- `scripts/contentful-sync-registry.js`: a declarative registry of content
  type IDs, labels, schema files, editor handlers, and optional seed handlers.
- `scripts/contentful-sync-cli.js`: Inquirer prompts, TTY detection, scope
  summary, confirmation, and invocation of selected registry handlers.
- `scripts/contentful-zero-touch.js`: reduced to reusable Contentful client,
  schema, editor, and seed functions; its existing non-interactive flags remain
  supported for compatibility.
- `scripts/contentful-upsert-policy.js`: remains the policy authority for
  existing-entry updates.
- `package.json`: `contentful:sync` becomes the interactive command and adds a
  documented non-interactive command for automation.

## Error handling

An empty content-type selection exits without contacting Contentful. A declined
confirmation exits without changes. Invalid registry configuration fails before
the confirmation prompt. A remote failure reports the selected operation and
content type, then exits non-zero; previously completed selected operations are
reported accurately and are not rolled back.

## Verification

Tests cover selection-to-handler mapping, empty and cancelled selections,
scoped model/editor updates, and the invariant that unselected types have no
remote calls. Existing content-upsert policy tests remain the guard for
entry-preservation behavior. Run the full test suite, lint, and isolated build;
exercise a dry-run interactive session before a real Contentful update.
