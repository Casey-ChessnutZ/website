# Generic Content Page Design

## Goal

Give editors a simple Contentful Page model for evergreen content such as Terms
and Conditions, Privacy, and FAQs without consuming the future root-slug landing
page namespace.

## Model and route

`page` has required `title`, `slug`, and rich-text `content`; optional `summary`,
`seoTitle`, and `seoDescription` provide excerpt and metadata support. Contentful
uses its built-in slug editor, derived from `title`.

Published pages render at `/page/{slug}`. The `/page` prefix is reserved for this
model so root-level slugs remain available for future Landing Page entries.

## Cache and delivery

Contentful requests use `contentful:page` and `contentful:page:{slug}` tags.
Webhook publish, unpublish, and delete events invalidate the matching public page
and dynamic `/page/[slug]` route. Development continues to bypass the data cache.

## Seed and presentation

Seed Terms and Conditions, Privacy, and FAQ examples. Render each with the
existing Contentful Rich Text renderer and the site’s editorial document styling.

## Acceptance criteria

1. Editors can create and publish a Page without JSON fields.
2. Published Page entries resolve at `/page/{slug}` with title, summary, and rich text.
3. Page webhook events use scoped cache invalidation.
4. Schema sync, tests, lint, and isolated build pass.
