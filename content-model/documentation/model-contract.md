# Content model contract

`landingPage` is the homepage record. The app selects its published `home` slug and
renders its ordered `sections` references. `featuredEvents` links only to published
`event` entries.

`event` owns the `/events/[slug]` route. `title` and `slug` are required; all detail
fields are optional and the page omits empty sections. Slugs must be unique.

`sectionBlock` is an ordered homepage module. The supported frontend block types are
`hero`, `featuredEvents`, `editorialText`, `imageGallery`, `timeline`, `cta`,
`countdown`, `imageBlock`, and `cardBlock`. Unsupported block types render a safe
placeholder instead of breaking the page.

`siteSettings` provides global branding, footer text, SEO defaults, and optional
`navigationConfig`. Its `items` array contains navigation objects with a `label`, internal `href`, `style`
(`text` or `primary`), and `enabled` flag. The frontend retains a minimal tournament
navigation fallback when no valid navigation items are published.
