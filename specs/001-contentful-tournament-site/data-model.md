# Data Model: Contentful Tournament Site

## Event

Represents a chess tournament or event page.

### Fields

- `title`: Display name for the tournament.
- `slug`: Unique route identifier.
- `summary`: Short description used on listings and page previews.
- `description`: Rich content for the event detail page.
- `eventDate`: Date and time of the tournament.
- `locationName`: Venue or online location label.
- `locationDetails`: Additional address or access details.
- `status`: Published, draft, archived, or upcoming display state.
- `heroMedia`: Optional image or banner asset.
- `registrationUrl`: Optional link for sign-up or external registration.
- `format`: Optional tournament format, such as Swiss or round-robin.
- `schedule`: Optional structured or rich schedule content.
- `prizeInformation`: Optional prize or award description.
- `eligibility`: Optional participant requirements or restrictions.
- `organizer`: Optional organizer reference or label.
- `tags`: Optional category or topic labels.

### Rules

- `title` and `slug` are required.
- `slug` must be unique.
- Optional fields may be omitted without preventing page rendering.
- Unpublished entries must not be treated as public pages.

## Landing Page

Represents the homepage as a configurable content record.

### Fields

- `title`: Internal page title.
- `slug`: Unique identifier for the Landing Page entry.
- `status`: Published, draft, archived, or scheduled display state.
- `heroHeadline`: Main landing-page message.
- `heroDescription`: Supporting copy for the hero area.
- `featuredEvents`: References to one or more event entries.
- `sections`: Ordered list of reusable section blocks.
- `seo`: Optional metadata for search and sharing.

### Rules

- The homepage should be composed from section references rather than hardcoded content.
- Multiple Landing Page entries may exist in Contentful for future use.
- The app currently renders the primary published Landing Page entry at `/`.
- Featured event references should resolve to published event entries.

## Section Block

Represents a reusable homepage module.

### Supported Block Types

- Featured events
- Editorial text
- Banner callout
- Stats or highlights
- Sponsor strip
- FAQ section
- Media and text split

### Rules

- Each block type should have a stable identifier.
- Unsupported block types should fail gracefully and not break the page.

## Site Settings

Represents shared global content used across the site.

### Fields

- `siteName`
- `logo`
- `defaultSeoTitle`
- `defaultSeoDescription`
- `socialLinks`
- `footerText`

### Rules

- Site settings should be referenced globally rather than duplicated per page.
