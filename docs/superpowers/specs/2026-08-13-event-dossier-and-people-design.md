# Event dossier and people directory design

## Scope

Redesign event detail pages as an editorial tournament dossier and introduce reusable people records for organisers and arbiters.

## Content model

`person`: name, slug, title, FIDE profile URL, rich-text biography, portrait, federation, and location.

`event` gains `officials` (Person references), `venueAddress`, latitude, longitude, venue notes, and structured `scheduleItems` containing time, title, and detail.

## Page experience

The event page uses a hero, sticky section navigation on large screens, a tournament-desk sidebar, timeline schedule, venue with Google Maps Embed API and address/directions fallback, officials rail, divisions, pairings, and registration information. Person profile pages provide biography, FIDE profile link, and the published events where the person is credited.

## Map behavior

When `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY`, coordinates, and address are available, show an accessible Google Maps Embed iframe. Otherwise show the address and an outbound Google Maps directions link. The API key is public by design but must be restricted to production domains and the Maps Embed API.
