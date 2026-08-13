# Editor-Friendly Homepage Blocks Design

## Goal

Replace the generic `sectionBlock` Contentful model with focused, editor-friendly homepage block types. Editors compose the home page by choosing and ordering meaningful block entries, without selecting a block type or entering structured JSON.

## Content model

`landingPage.sections` stays as the ordered composition field. Its entry-link validation accepts the ten new block content types below and no longer accepts `sectionBlock`.

| Content type | Required editor fields | Optional editor fields |
| --- | --- | --- |
| `homeHero` | title | eyebrow, body, image, primary CTA label/URL, secondary CTA label/URL |
| `richTextSection` | title, body | eyebrow |
| `imageTextSection` | title, image, body | eyebrow, image-on-left, CTA label/URL |
| `featuredEventsSection` | title, events | eyebrow, body |
| `eventCountdownSection` | title, target date | eyebrow, body, CTA label/URL |
| `featureCardsSection` | title, cards | eyebrow, body |
| `imageGallerySection` | title, images | eyebrow, body |
| `timelineSection` | title, items | eyebrow, body |
| `quoteSection` | quote, attribution | role, image |
| `ctaBannerSection` | title, CTA label, CTA URL | eyebrow, body, theme |

Supporting entry types keep repeated content readable in the editor.

| Content type | Fields |
| --- | --- |
| `featureCard` | title, body, image, link label, link URL |
| `timelineItem` | title, date, body |

This consumes twelve of the space's twenty-five permitted types when combined with the existing Event, News, Person, Site Settings, and Landing Page models, leaving room for future editorial features.

## Migration and deletion

This is an early-development clean break. The migration permanently deletes the `sectionBlock` content type and its previous entries after the landing page is repointed to the new entries. It permanently drops legacy fields introduced during the recent development cycle instead of leaving omitted compatibility fields. The Event model retains only its current documented field set; obsolete aliases are removed from schema, seed data, mapping, tests, and editor documentation.

Contentful requires fields to be omitted and published before deletion. The sync script performs that two-phase workflow and waits for deletion to complete before seeding the new homepage references.

## Rendering architecture

The Contentful query includes linked entries and assets. The mapper derives a section renderer key from `sys.contentType.sys.id`, produces a discriminated `HomepageSection` type, and resolves linked assets, events, cards, and timeline items. The block registry dispatches on that key. Unknown entries render a small safe editorial fallback rather than breaking the page.

The visual system stays editorial: warm paper surfaces, ink typography, oxblood actions, brass metadata, responsive editorial grids, visible keyboard focus, and reduced-motion-safe transitions. Image + Text alternates media placement with a simple checkbox. Gallery and cards reserve image space to avoid layout shift.

## Seeded homepage

The `home` Landing Page is republished with an ordered example of each new section: Hero, Rich Text, Image + Text, Featured Events, Countdown, Feature Cards, Gallery, Timeline, Quote, and CTA Banner. Existing sample events and assets are reused where appropriate; the script creates small related entries for feature cards and timeline items.

## Acceptance criteria

1. Contentful no longer exposes `sectionBlock` or JSON-based homepage fields.
2. Editors can create all ten homepage section types using only purpose-specific fields, and Landing Page can order them in `sections`.
3. The published `/` page renders all ten seeded types responsively with no unsupported-block fallback.
4. The old section entries and legacy fields are deleted from Contentful and local schema, mapping, seed code, and editor documentation.
5. Contentful schema sync, unit tests, lint, and the isolated build pass.
