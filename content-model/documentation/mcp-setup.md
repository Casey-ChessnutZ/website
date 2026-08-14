# Contentful MCP setup

Contentful MCP is a development-time tool. It may inspect the Event, Landing Page,
Section Block, and Site Settings types, but the public application always reads from
the Contentful Delivery or Preview API.

1. Set `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ENVIRONMENT`, and a Contentful management
   token in `.env.local`. Do not commit that file.
2. Start the MCP server with `npm run mcp:start` and connect it using the workspace
   MCP configuration.
3. Use MCP to inspect existing content types and entries before changing schemas.
4. Apply schema changes with `npm run contentful:sync` only after reviewing the JSON
   schemas in `content-model/schemas/`.

The runtime uses `CONTENTFUL_ACCESS_TOKEN` for normal visitors. Draft content is
request-scoped through Next.js Draft Mode; see [content preview](content-preview.md)
for the editor setup. Do not set a global preview environment toggle: that would
make draft content visible to all visitors.
