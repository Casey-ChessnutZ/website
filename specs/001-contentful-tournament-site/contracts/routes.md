# Contract: Public Routes

## Homepage

- Path: `/`
- Purpose: Introduce the tournament site and surface featured or upcoming events.
- Source: Landing Page content type plus shared site settings.

## Event Detail Page

- Path: `/events/[slug]`
- Purpose: Present a single tournament in a shareable detail view.
- Source: Event content type.

## Route Expectations

- Published event entries must resolve to a unique route.
- Unpublished or missing entries should not render as public pages.
- Route output should remain SEO-friendly and safe for sharing.
