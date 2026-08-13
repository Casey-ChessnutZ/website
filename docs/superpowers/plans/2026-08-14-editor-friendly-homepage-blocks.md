# Editor-Friendly Homepage Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace JSON-driven homepage section blocks with ten focused Contentful models and publish a fully rendered example homepage.

**Architecture:** The Landing Page owns an ordered `sections` array of links restricted to named section types. The Contentful mapper normalizes each linked entry based on its content-type ID into a discriminated homepage-section union; a registry renders the matching focused React component. The zero-touch script performs the destructive Contentful migration in dependency order, then repoints and publishes the home entry.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind CSS v4, Contentful Management and Delivery APIs, Node built-in test runner.

## Global Constraints

- Use Contentful built-in slug editor on every new slug-bearing model, sourced from its display field.
- Keep total Contentful models at or below 25; this design adds twelve and deletes `sectionBlock`.
- Remove the old `sectionBlock` content type and JSON/object section fields; do not retain compatibility aliases.
- Permanently delete the obsolete Event fields `venueLatitude`, `venueLongitude`, and `scheduleItems` after Contentful's omit-and-publish transition.
- Preserve production ISR tags and bypass cached Contentful reads only in development.
- Ensure all images have meaningful alt text, reserved aspect ratios, keyboard focus, and reduced-motion-safe interactions.
- Do not stage, commit, or reset unrelated shared-worktree changes.

---

### Task 1: Define focused Contentful schemas and landing-page links

**Files:**
- Create: `content-model/schemas/home-hero.schema.json`, `content-model/schemas/rich-text-section.schema.json`, `content-model/schemas/image-text-section.schema.json`, `content-model/schemas/featured-events-section.schema.json`, `content-model/schemas/event-countdown-section.schema.json`, `content-model/schemas/feature-cards-section.schema.json`, `content-model/schemas/image-gallery-section.schema.json`, `content-model/schemas/timeline-section.schema.json`, `content-model/schemas/quote-section.schema.json`, `content-model/schemas/cta-banner-section.schema.json`, `content-model/schemas/feature-card.schema.json`, `content-model/schemas/timeline-item.schema.json`
- Modify: `content-model/schemas/landing-page.schema.json`, `content-model/schemas/event.schema.json`, `content-model/schemas/README.md`, `content-model/documentation/model-contract.md`, `content-model/documentation/editor-guide.md`
- Test: `tests/content-model-schemas.test.ts`

**Consumes:** Existing JSON schema files and Contentful field conventions.

**Produces:** `homepageSectionContentTypes` link-validation IDs and a Landing Page schema without `heroHeadline`, `heroDescription`, or `featuredEvents`.

- [ ] **Step 1: Write schema contract tests**

```ts
test('landing page accepts only the focused homepage section content types', () => {
  const landingPage = readSchema('landing-page.schema.json');
  const sections = landingPage.fields.find((field) => field.id === 'sections');
  assert.deepEqual(sections.items.validations[0].linkContentType, homepageSectionContentTypes);
  assert.equal(readSchema('section-block.schema.json', false), null);
});

test('event has no obsolete legacy fields', () => {
  const ids = readSchema('event.schema.json').fields.map((field) => field.id);
  assert.equal(ids.includes('venueLatitude'), false);
  assert.equal(ids.includes('venueLongitude'), false);
  assert.equal(ids.includes('scheduleItems'), false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --experimental-strip-types --test tests/content-model-schemas.test.ts`

Expected: FAIL because the focused models and landing-page validation do not exist.

- [ ] **Step 3: Create schemas with purpose-specific fields**

Use Symbol fields for labels/URLs/eyebrows, RichText for long copy, Asset links for images, Boolean `imageOnLeft` for Image + Text, Symbol `theme` constrained to `ink|oxblood|paper` for CTA Banner, Event links for Featured Events, and Entry links constrained to `featureCard` or `timelineItem` for repeated content. Add only `title` and `slug` for support entry models where a URL-stable editor identifier is useful; section entries use `title` as display field and no slug.

- [ ] **Step 4: Update landing and Event schemas plus docs**

Remove legacy Landing Page hero/featured fields and the obsolete Event fields. Document the new authoring workflow and keep the `sections` field's link validation restricted to the ten section IDs.

- [ ] **Step 5: Run schema test**

Run: `node --experimental-strip-types --test tests/content-model-schemas.test.ts`

Expected: PASS.

### Task 2: Make Contentful sync delete obsolete models/fields safely and seed the new homepage

**Files:**
- Modify: `scripts/contentful-zero-touch.js`
- Test: `tests/contentful-zero-touch.test.ts`

**Consumes:** Task 1 schema IDs and a Contentful management client.

**Produces:** `removeContentType`, `removeDeprecatedFields`, and a live `home` entry that references each new block exactly once.

- [ ] **Step 1: Write migration-unit tests**

```ts
test('migration unpublishes and deletes legacy section entries before deleting sectionBlock', async () => {
  const calls = await runMigration(fakeClient);
  assert.deepEqual(calls, ['entry.unpublish', 'entry.delete', 'contentType.delete']);
});

test('new home seed orders every focused section type', () => {
  assert.deepEqual(seedHome().sections.map((section) => section.contentType), homepageSectionContentTypes);
});
```

- [ ] **Step 2: Run migration tests to verify failure**

Run: `node --experimental-strip-types --test tests/contentful-zero-touch.test.ts`

Expected: FAIL because migration helpers and new seed data do not exist.

- [ ] **Step 3: Implement a two-phase deletion helper**

For obsolete Event fields, update the model with `{ omitted: true }`, publish, re-fetch the current version, remove the fields, and publish again. For `sectionBlock`, first update the Landing Page to remove references, publish it, then unpublish/delete every `sectionBlock` entry, unpublish/delete the content type. Treat absent legacy resources as a successful no-op.

- [ ] **Step 4: Sync new models and configure slug editors**

Run `upsertContentType` for all twelve schemas; call `configureSlugEditor` only for schemas that contain a slug, with `title` as tracking field for `featureCard` and `timelineItem`.

- [ ] **Step 5: Seed home section entries and publish Landing Page**

Create Hero, Rich Text, Image + Text, Featured Events, Countdown, Feature Cards, Gallery, Timeline, Quote, and CTA Banner entries. Reuse event links and available assets; create three feature cards and four timeline items. Publish the home entry only after all new entries exist, with `sections` in the design order.

- [ ] **Step 6: Run migration tests**

Run: `node --experimental-strip-types --test tests/contentful-zero-touch.test.ts`

Expected: PASS.

### Task 3: Replace generic homepage mapping with typed section mapping

**Files:**
- Modify: `app/lib/contentful/types.ts`, `app/lib/contentful/queries.ts`, `app/lib/contentful/cache-revalidation.ts`
- Test: `tests/contentful-mapping.test.ts`, `tests/contentful-cache-revalidation.test.ts`

**Consumes:** The Task 1 content-type IDs.

**Produces:** `HomepageSection` discriminated union, `mapHomepageSection`, and Contentful cache tags for every new section type.

- [ ] **Step 1: Extend mapping tests**

```ts
test('maps an image text section with its asset and position toggle', () => {
  const section = mapHomepageSection(imageTextEntry, { Asset: [heroAsset] });
  assert.equal(section.type, 'imageTextSection');
  assert.equal(section.imageOnLeft, true);
  assert.equal(section.image.url, 'https://images.ctfassets.net/example.jpg');
});

test('maps feature-card and timeline references without JSON fields', () => {
  assert.equal(mapHomepageSection(cardsEntry, includes).cards[0].title, 'Classical');
  assert.equal(mapHomepageSection(timelineEntry, includes).items[0].date, 'September');
});
```

- [ ] **Step 2: Run mapping tests to verify failure**

Run: `node --experimental-strip-types --test tests/contentful-mapping.test.ts`

Expected: FAIL because the mapper still expects `blockType` and JSON fields.

- [ ] **Step 3: Define narrow TypeScript section types and mapper**

Remove `LandingPageBlockType`, `LandingPageBlock`, `SectionBlockEntry`, and `mergeSectionBlockFields`. Map each `sys.contentType.sys.id` to typed fields, resolving nested Entry and Asset links from includes. Keep a narrow unknown-section fallback type for unpublished/misconfigured entries.

- [ ] **Step 4: Update landing query tags and webhook cache plan**

Have `getPublishedLandingPage()` tag all ten section types plus `featureCard`, `timelineItem`, Event, and Landing Page. Expand cache revalidation support to invalidate `/` for each new block/support content type, and remove `sectionBlock` support.

- [ ] **Step 5: Run mapping and revalidation tests**

Run: `node --experimental-strip-types --test tests/contentful-mapping.test.ts tests/contentful-cache-revalidation.test.ts`

Expected: PASS.

### Task 4: Implement focused visual blocks and new registry

**Files:**
- Create: `app/components/content/home-hero-section.tsx`, `app/components/content/rich-text-section.tsx`, `app/components/content/image-text-section.tsx`, `app/components/content/featured-events-section.tsx`, `app/components/content/event-countdown-section.tsx`, `app/components/content/feature-cards-section.tsx`, `app/components/content/image-gallery-section.tsx`, `app/components/content/timeline-section.tsx`, `app/components/content/quote-section.tsx`, `app/components/content/cta-banner-section.tsx`
- Modify: `app/components/content/block-registry.tsx`, `app/components/content/render-blocks.tsx`, `app/(site)/page.tsx`
- Delete: `app/components/content/card-block.tsx`, `app/components/content/countdown-block.tsx`, `app/components/content/cta-block.tsx`, `app/components/content/editorial-text-block.tsx`, `app/components/content/featured-events-block.tsx`, `app/components/content/hero-block.tsx`, `app/components/content/image-block.tsx`, `app/components/content/image-gallery-block.tsx`, `app/components/content/timeline-block.tsx`
- Test: `tests/homepage-section-rendering.test.tsx`

**Consumes:** `HomepageSection` from Task 3.

**Produces:** Content-type-driven responsive blocks with no JSON field casts.

- [ ] **Step 1: Write renderer coverage test**

```tsx
test('renders every seeded homepage section without unsupported fallback', () => {
  const html = renderToStaticMarkup(<RenderBlocks sections={allSeededSections} />);
  for (const title of ['Find your next board', 'A considered calendar', 'Ready when you are']) {
    assert.match(html, new RegExp(title));
  }
  assert.doesNotMatch(html, /Unsupported homepage section/);
});
```

- [ ] **Step 2: Run rendering test to verify failure**

Run: `node --experimental-strip-types --test tests/homepage-section-rendering.test.tsx`

Expected: FAIL because renderer accepts the old generic block type.

- [ ] **Step 3: Implement the section components using Tailwind utilities**

Use the existing paper/ink/oxblood/brass tokens. Hero is full-bleed with a readable image overlay and two CTAs. Image + Text is a responsive two-column grid with the image order determined by `imageOnLeft`. Cards and gallery use fixed aspect-ratio media frames; Timeline and Quote use restrained editorial rules. Links have `focus-visible` rings; interactive transitions only change opacity/transform and include `motion-reduce` variants.

- [ ] **Step 4: Replace the registry and simplify page shell**

Dispatch directly on `section.type`; delete the old components and remove the hard-coded secondary homepage hero/content so the Contentful order is the sole homepage composition source.

- [ ] **Step 5: Run renderer test**

Run: `node --experimental-strip-types --test tests/homepage-section-rendering.test.tsx`

Expected: PASS.

### Task 5: Update project task list, synchronise Contentful, and verify live output

**Files:**
- Modify: `specs/001-contentful-tournament-site/tasks.md`, `content-model/documentation/contentful-isr-webhook.md`
- Test: existing full suite

**Consumes:** Tasks 1–4.

**Produces:** checked implementation tasks and a published, verified Contentful homepage.

- [ ] **Step 1: Add and track migration tasks**

Append a dedicated sequence for focused homepage models, destructive legacy deletion, typed mapper/registry, seed verification, and cache webhook changes. Mark each task `[X]` only after its verification command succeeds.

- [ ] **Step 2: Run local verification before Contentful mutation**

Run: `npm run verify:isolated`

Expected: all unit tests, ESLint, and `.next-isolated` build pass without changing the live dev build directory.

- [ ] **Step 3: Synchronise Contentful with approved destructive scope**

Run: `npm run contentful:sync`

Expected: obsolete fields and `sectionBlock` are deleted; twelve focused models and the example `home` sections are published.

- [ ] **Step 4: Verify live Contentful state and local homepage**

Read Contentful Management API content types to confirm `sectionBlock` is absent and legacy Event field IDs are absent. Read the Delivery API home entry and confirm ten linked section content-type IDs. Request `http://localhost:3001/` and confirm every seeded section heading is present.

- [ ] **Step 5: Run final isolated verification and complete task list**

Run: `npm run verify:isolated`

Expected: all tests, lint, and isolated production build pass. Mark the five migration task groups complete in `tasks.md`.
