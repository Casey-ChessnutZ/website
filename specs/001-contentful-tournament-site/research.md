# Research: Contentful Tournament Site

## Decision 1: Use Next.js App Router for the public site

- Decision: Build the website as a Next.js App Router application.
- Rationale: It supports route-based rendering for the homepage and event pages, is a strong fit for Vercel, and keeps page composition close to the content model.
- Alternatives considered: A client-only React SPA was rejected because SEO and shareable event pages are core requirements; a separate backend/frontend split was rejected because the feature does not need a custom application API in v1.

## Decision 2: Treat Contentful as the only source of truth for public content

- Decision: Keep all public landing-page and event content in Contentful.
- Rationale: The user explicitly wants content-driven pages and editor-owned updates without code changes.
- Alternatives considered: Storing content in a local database was rejected because it would duplicate editorial workflow and reduce the value of Contentful.

## Decision 3: Model the homepage as modular sections

- Decision: Represent the homepage as a page entry that references reusable section blocks.
- Rationale: This keeps the landing page flexible while preserving a controlled set of supported section patterns.
- Alternatives considered: A single monolithic homepage content type was rejected because it would be harder to evolve and reuse across future pages.

## Decision 4: Use a dedicated event content type with optional fields

- Decision: Define one canonical event entry type for chess tournaments with core and optional fields.
- Rationale: A stable event model keeps event pages consistent while allowing variation in prize details, schedules, and registration data.
- Alternatives considered: Separate content types per tournament category were rejected because they would fragment the model and complicate editor workflows.

## Decision 5: Expose Contentful model inspection through MCP for development workflows

- Decision: Configure Contentful MCP as a development-time capability so an LLM can inspect entries and content types directly.
- Rationale: This supports content-aware assistance without coupling MCP into the runtime delivery path.
- Alternatives considered: Manually documenting the schema only was rejected because it would drift from the live content model over time.

## Decision 6: Deploy on Vercel

- Decision: Use Vercel for preview and production deployments.
- Rationale: It matches the requested deployment target and is well suited for Next.js hosting.
- Alternatives considered: Self-hosted deployment was rejected because it adds operational work without improving the feature scope.
