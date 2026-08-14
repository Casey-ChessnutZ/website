# Content Preview Design

## Goal

Let Contentful editors view unpublished changes at the appropriate site URL without exposing preview credentials or changing the published site's ISR behaviour.

## Architecture

Next.js Draft Mode is the sole switch for preview. `GET /api/preview` validates a server-only `CONTENTFUL_PREVIEW_SECRET`, resolves a supplied Contentful entry ID through the Preview API, maps its actual content type and slug to a safe site route, enables Draft Mode, and redirects the editor there. `GET /api/preview/exit` disables Draft Mode and returns the editor to a safe internal route.

Server components read Draft Mode and pass a `preview` boolean to Contentful query functions. The fetch layer chooses the Content Preview API and `CONTENTFUL_PREVIEW_ACCESS_TOKEN` only when that boolean is true, using `no-store`; normal requests continue to use the Delivery API, cache tags, and the existing one-hour revalidation policy. The former global `CONTENTFUL_PREVIEW` toggle is removed.

## Scope

- Preview the home page, event calendar/detail, news list/detail, generic pages, team directory/profiles, and shared Site Settings.
- Preserve existing published route URLs, cache tags, and Contentful publish-webhook handling.
- Support one Contentful Preview URL targeting `/api/preview?secret=...&entryId={entry.sys.id}` and a clear exit URL for editors.
- Document Vercel configuration, including the optional Protection Bypass requirement for protected deployments.

## Security and failure handling

- Preview tokens and the preview secret remain server-only environment variables.
- A missing or invalid secret returns `401`; a missing or invalid entry ID returns `400`.
- Preview entry IDs must be Contentful-style alphanumeric IDs, and only a fixed allow-list of content types can resolve to a site route.
- Missing preview credentials leave Contentful fetches empty rather than falling back to the Delivery token, preventing accidental draft exposure.
- Preview content is never stored in Next's Data Cache.

## Tests

- Unit-test preview path validation and explicit preview client configuration.
- Assert queries accept and forward the preview state, and that the task documentation lists the Contentful configuration steps.
- Run the project's isolated test, lint, and production-build verification command.

## Editor setup

Set `CONTENTFUL_PREVIEW_ACCESS_TOKEN` and a long random `CONTENTFUL_PREVIEW_SECRET` in local and Vercel environments. Configure each Contentful preview type with the same URL, `/api/preview?secret=...&entryId={entry.sys.id}`. If Vercel Deployment Protection is enabled, configure its Protection Bypass for Automation and include that token as documented by Contentful.
