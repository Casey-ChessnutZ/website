# Vercel Analytics Integration Design

## Goal

Enable Vercel Web Analytics for the site without custom tracking code, cookies,
or changes to Contentful rendering.

## Implementation

Add `@vercel/analytics` to runtime dependencies and render its `Analytics`
component once in `app/layout.tsx`, after the application body content. The
component is inert for local development and reports analytics when deployed to
Vercel.

## Acceptance criteria

1. The root layout renders one `Analytics` component.
2. The package lockfile records the dependency.
3. Tests, lint, and the isolated production build pass.
