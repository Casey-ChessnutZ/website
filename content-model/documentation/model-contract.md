# Content model contract

`landingPage` is the homepage record. The app selects its published `home` slug and
renders its ordered `sections` references.

`event` owns the `/events/[slug]` route. `title` and `slug` are required; all detail
fields are optional and the page omits empty sections. Slugs must be unique.

`landingPage.sections` is an ordered list of focused homepage module entries: Home
Hero, Rich Text, Image & Text, Featured Events, Event Countdown, Feature Cards,
Image Gallery, Timeline, Quote, and CTA Banner. Each entry exposes only the fields
needed for its layout; no JSON section configuration is used.

`siteSettings` provides global branding, footer text, SEO defaults, and optional
`navigationConfig`. Its `items` array contains navigation objects with a `label`, internal `href`, `style`
(`text` or `primary`), and `enabled` flag. The frontend retains a minimal tournament
navigation fallback when no valid navigation items are published.
