MCP server — run and apply Contentful changes

Overview

This project is configured to use the Contentful MCP server for LLM-assisted inspection and editing of Contentful spaces. The MCP server provides a bridge so an LLM can read content types, entries, and propose changes. Use the MCP server to review or propose edits, then apply changes to a development Contentful space.

Important safety notes

- Always run MCP against a development or staging space first. Do NOT apply schema changes directly to production without review and a backup.
- Keep `CONTENTFUL_MANAGEMENT_TOKEN` secret. Do not commit it to the repository.

Environment variables

Provide these env variables before starting the MCP server (you can use a local `.env` file):

- `CONTENTFUL_SPACE_ID` — the target Contentful space id
- `CONTENTFUL_ENVIRONMENT` — the environment (default: `master`)
- `CONTENTFUL_MANAGEMENT_TOKEN` — management token with permissions to update content types and entries
- `CONTENTFUL_ACCESS_TOKEN` — delivery API token (used for reading content)
- `CONTENTFUL_PREVIEW_ACCESS_TOKEN` — preview API token (optional)

Start the MCP server (recommended local flow)

```bash
# from project root
npm run mcp:start
```

This runs `npx -y @contentful/mcp-server` using the env variables from your shell. The server prints a local URL (usually http://localhost:PORT) — open it in your browser.

Using the MCP UI

- Inspect content types and entries in the selected environment.
- Ask the MCP/LLM agent to propose migrations or content edits.
- Review proposed edits carefully.
- You can ask the MCP to produce a Contentful migration script (JS) or to apply changes directly using the management token.

Applying changes safely

Option A — Apply via Management API through MCP (direct):
- Use a non-production space and ensure the management token has only necessary scopes.
- When MCP proposes a change, review the code and accept to apply.

Option B — Generate migration code and run locally (recommended):
1. Use MCP to generate migration JS (Contentful Migration format) or a management API script.
2. Save the migration into `migrations/` and commit to your repo.
3. Run the migration locally against a dev space:

```bash
# Example run (migration runner not included in this repo):
CONTENTFUL_SPACE_ID=your_dev_space \
CONTENTFUL_MANAGEMENT_TOKEN=your_token \
CONTENTFUL_ENVIRONMENT=master \
node migrations/2026-08-13-create-event-ctype.js
```

Rollback and backups

- Export the space before large changes using the Contentful CLI or UI.
- Keep migration scripts idempotent and reversible when possible.

If you want, I can:
- Add an example migration runner and a sample migration file for the `event` content type I created in `content-model/schemas`.
- Start the MCP server for you (if you provide a management token in the environment), or walk through a local run step-by-step.
 
Migrations

This repository includes a migration runner and two example migrations under `migrations/`:

- `migrations/001-create-event-ctype.js` — creates the `event` content type
- `migrations/002-create-sample-event-entry.js` — creates a sample event entry and publishes it

Run all migrations (against a non-production space):

```bash
CONTENTFUL_SPACE_ID=your_dev_space \
CONTENTFUL_MANAGEMENT_TOKEN=your_token \
CONTENTFUL_ENVIRONMENT=master \
npm run migrations:run
```

This uses `contentful-management` to execute migrations in order. Review the migration files before running and always test in a safe environment first.

