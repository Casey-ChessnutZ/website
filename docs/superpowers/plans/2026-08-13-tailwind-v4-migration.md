# Tailwind v4 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site’s bespoke component CSS with Tailwind CSS v4 utilities while preserving the Contentful-driven chess tournament experience.

**Architecture:** Tailwind v4 is integrated through PostCSS and `app/globals.css` owns only the Tailwind import, semantic editorial design tokens, and global accessibility defaults. Route and component markup owns layout, typography, responsive behavior, hover states, and UI composition through utility classes. No Contentful query or data-model contracts change.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, PostCSS, Contentful.

## Global Constraints

- Retain `CONTENTFUL_OFFLINE` and `.next-isolated` behavior for all isolated builds.
- Preserve the warm ivory, ink, oxblood, and brass editorial visual language.
- Keep keyboard focus visible, preserve the skip link, and respect reduced-motion preferences.
- Do not change Contentful content types, delivery queries, or published entries.

---

### Task 1: Integrate Tailwind v4 and theme tokens

**Files:**
- Modify: `package.json`
- Create: `postcss.config.mjs`
- Modify: `app/globals.css`
- Test: `npm run verify:isolated`

- [X] Install `tailwindcss`, `@tailwindcss/postcss`, and `postcss` as development dependencies.
- [X] Configure the official Tailwind PostCSS plugin in `postcss.config.mjs`.
- [X] Replace component selectors in `app/globals.css` with Tailwind import, CSS-first editorial color/font tokens, base element rules, focus treatment, skip-link styling, and reduced-motion media query.
- [X] Run `npm run verify:isolated` and confirm utility generation succeeds without Contentful requests.

### Task 2: Migrate the shared shell and homepage

**Files:**
- Modify: `app/components/shared/site-header.tsx`
- Modify: `app/(site)/layout.tsx`
- Modify: `app/(site)/page.tsx`
- Test: `npm run verify:isolated`

- [X] Replace custom shell, navigation, hero, featured-event, and footer classes with responsive Tailwind utilities.
- [X] Preserve mobile navigation behavior, active states, 44px touch targets, responsive hero image, and reduced-motion-safe entrance motion.
- [X] Run `npm run verify:isolated`.

### Task 3: Migrate reusable blocks and event routes

**Files:**
- Modify: `app/components/content/*.tsx`
- Modify: `app/components/events/*.tsx`
- Modify: `app/(site)/events/page.tsx`
- Modify: `app/(site)/events/[slug]/page.tsx`
- Test: `npm run verify:isolated`

- [X] Replace remaining custom presentational classes and inline styles with Tailwind utilities.
- [X] Preserve block fallback behavior, image sizing, event information hierarchy, and external registration behavior.
- [X] Run `npm run verify:isolated` and `git diff --check`.
