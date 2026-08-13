# Our Team directory design

## Goal

Create a memorable, Contentful-driven team directory at `/team` that introduces the people behind ChessNutZ and routes every profile to `/team/[slug]`.

## Scope

- Reuse the existing `person` Contentful model and published people.
- Add a list query and a responsive `/team` route.
- Move the existing person profile experience from `/people/[slug]` to `/team/[slug]`.
- Update event-official cards and primary navigation to use the Team route.
- Preserve graceful image fallbacks and the useful profile metadata: role, federation, location, FIDE profile, biography, and related events.

## Visual direction

The page follows the site’s elevated editorial tournament-journal system: warm paper surfaces, near-black ink, oxblood for the hero, and brass as the accent. It must not introduce a second colour or type system.

The opening is an oxblood banner with a restrained brass rule, a compact eyebrow, oversized display heading, and concise copy. The directory then shifts to paper and uses an asymmetric-but-regular editorial grid: one-column cards on small screens, two columns at tablet widths, and three columns on wider screens.

Each person card is a full-card link with a portrait or monogram fallback, role, federation/location metadata, and a simple SVG arrow. Hover and keyboard focus use existing border, shadow, and small transform rhythms; reduced-motion users retain a static presentation. Cards have a minimum 44px interactive target and descriptive image alt text.

## Data and routing

`getPublishedPeople()` fetches all published `person` entries in name order and carries the `person` cache tag. `/team` renders the roster and an explanatory empty state if no people are published. `/team/[slug]` reuses the established profile layout and related-event lookup. `/people/[slug]` is removed in favour of the canonical Team route, and every official card links to `/team/[slug]`.

The primary navigation receives an enabled `Our Team` item at `/team` in both the safe fallback and the seeded Site Settings configuration.

## Verification

Add mapping/query tests as appropriate, run the isolated verification command, and check the route is included in the production build. Update the feature task list only after verification passes.
