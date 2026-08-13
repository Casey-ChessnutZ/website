# Quickstart: Contentful Tournament Site

## Prerequisites

- Access to the Contentful space and environment for the tournament content.
- A Vercel project or deployment target for preview and production.
- Contentful MCP configured for development-time model inspection.

## Validate the Content Model

1. Open the Contentful space and confirm the following content types exist: Event, Landing Page, Section Block, and Site Settings.
2. Verify that the Event type includes required fields for title and slug, plus optional fields for schedule, registration, prize information, and eligibility.
3. Confirm the Landing Page references reusable section blocks instead of duplicating page content.

## Validate the Site

1. Start the Next.js application in preview or local development mode.
2. Open the homepage and verify it renders a branded landing page driven by Contentful content.
3. Open a published event page and verify it shows the event title, summary, date, location, and any populated optional sections.
4. Publish a content change in Contentful and confirm the site reflects the update through the normal delivery flow.

## Validate MCP Support

1. Connect the Contentful MCP tool to the project’s configured space and environment.
2. Inspect the Event and Landing Page content types through the MCP workflow.
3. Confirm an LLM-assisted workflow can read the content model without duplicating schema knowledge in the application code.

## Expected Outcome

- The homepage and event pages render from Contentful-driven content.
- Missing optional fields do not break rendering.
- Content editors can update pages without code changes.
