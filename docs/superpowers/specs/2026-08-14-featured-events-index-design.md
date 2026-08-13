# Featured Events Index Design

## Goal

Replace the unfinished equal-weight Featured Events grid with an editorial
tournament index that makes the first selected event the visual lead while
keeping every configured event easy to compare and open.

## Layout

On desktop, the first event is a substantial lead card beside a numbered event
list. On mobile the lead card is first, followed by full-width list links.
The lead card presents a date tile, title, summary, format/location labels, and
an arrow affordance. List rows retain date, title, compact details, and an arrow.

## Interaction and accessibility

Every card/row remains a single semantic link with a minimum 44px target,
visible `focus-visible` ring, readable labels, and no hover-only information.
Hover and active state use 200ms transform/color transitions; reduced-motion
users receive static state changes. Existing editorial color tokens are used:
ink, paper, oxblood, brass, and rule.

## Data and scope

The existing `Featured Events Section.events` references remain unchanged. The
component uses the already-mapped event title, summary, date, format, and
location fields. No Contentful model, mapping, seed, or cache changes are needed.

## Acceptance criteria

1. A configured first event is visually distinct from remaining events.
2. All event links work with missing optional date, format, or location.
3. The layout has no horizontal overflow from 375px upward.
4. Focus, touch targets, and reduced-motion behavior meet the site UI standard.
