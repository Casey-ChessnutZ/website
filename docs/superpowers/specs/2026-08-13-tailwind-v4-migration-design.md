# Tailwind v4 Migration Design

## Intent

Move ChessNutZ’s presentational layer from bespoke component CSS to Tailwind CSS v4 without changing its Contentful content model, navigation behavior, or editorial visual identity.

## Visual system

The page remains an editorial tournament journal: warm ivory surfaces, near-black ink, oxblood actions, and brass metadata accents. Newsreader remains the display face and Roboto the reading face. A single, full-bleed image hero carries the home-page emphasis; supporting content uses restrained rules, flat card grids, and modest interaction movement.

## Implementation

Tailwind v4 is installed through its official PostCSS integration. `app/globals.css` imports Tailwind, defines CSS-first tokens with `@theme`, and retains only global defaults: base typography, focus treatment, and reduced-motion behavior. Components use responsive utilities for layout, color, type, spacing, interaction states, and animation.

## Constraints

- CMS data and Contentful fetch behavior remain unchanged.
- The live development cache remains `.next`; isolated validation remains `.next-isolated` and offline.
- All interactive elements retain a visible focus state and 44px minimum touch target where applicable.
- Motion remains transform/opacity-based and is disabled under reduced-motion preferences.

## Validation

Run `npm run verify:isolated` to execute the existing tests, linting, and an offline production build. Confirm no legacy presentational CSS selectors or inline style attributes remain in application components.
