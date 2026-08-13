# Our Team Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a content-driven `/team` directory and canonical `/team/[slug]` profiles for ChessNutZ tournament people.

**Architecture:** The Contentful query layer adds a name-ordered person collection using the existing `PersonEntry` shape and existing cache tags. A dedicated Team page composes a server-rendered editorial hero and focused card grid; the existing profile route moves under `/team` so all event official cards and global navigation use one canonical path.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS v4, Contentful Delivery API, Node test runner.

## Global Constraints

- Retain the existing Newsreader/Roboto editorial system and paper/ink/oxblood/brass tokens.
- Use SVG or text only for decorative controls; do not introduce emoji icons or an icon package.
- Cards must be keyboard-accessible full-card links with visible focus and a minimum 44px target.
- Keep motion to transform/opacity transitions at 150–300ms; existing reduced-motion rules remain authoritative.
- Continue using `npm run verify:isolated`; do not write to the active `.next` development directory.

---

### Task 1: Add the people collection query and its test

**Files:**
- Modify: `app/lib/contentful/queries.ts`
- Create: `tests/person-collection.test.ts`

**Interfaces:**
- Consumes: `ContentfulPersonItem`, `ContentfulCollection<T>`, `mapPersonItem`, `contentfulFetch`, and `contentfulTags('person')`.
- Produces: `getPublishedPeople(): Promise<PersonEntry[]>`, ordered by `fields.name` and mapped through `mapPersonItem`.

- [X] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';

import { mapPersonCollection } from '../app/lib/contentful/queries.ts';

test('maps an alphabetically ordered Contentful person collection', () => {
  assert.deepEqual(
    mapPersonCollection({ items: [
      { sys: { id: 'p-1' }, fields: { name: 'Alex Morgan', slug: 'alex-morgan' } },
    ] }),
    [{ sys: { id: 'p-1' }, name: 'Alex Morgan', slug: 'alex-morgan' }],
  );
});
```

- [X] **Step 2: Run the focused test to verify it fails**

Run: `node --experimental-strip-types --test tests/person-collection.test.ts`

Expected: FAIL because `mapPersonCollection` is not exported.

- [X] **Step 3: Implement the minimal query and collection mapper**

```ts
export function mapPersonCollection(
  response: ContentfulCollection<ContentfulPersonItem> | null,
): PersonEntry[] {
  return (response?.items ?? []).map((item) => mapPersonItem(item, response?.includes));
}

export async function getPublishedPeople(): Promise<PersonEntry[]> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulPersonItem>>('entries', {
    content_type: 'person',
    include: '2',
    order: 'fields.name',
    limit: '100',
  }, contentfulTags('person'));

  return mapPersonCollection(response);
}
```

- [X] **Step 4: Run the focused test to verify it passes**

Run: `node --experimental-strip-types --test tests/person-collection.test.ts`

Expected: PASS.

- [X] **Step 5: Record the query and test change set (no commit: shared dirty worktree)**

```bash
git add app/lib/contentful/queries.ts tests/person-collection.test.ts
git commit -m "feat: query published team members"
```

### Task 2: Build the editorial Team directory route

**Files:**
- Create: `app/(site)/team/page.tsx`
- Create: `app/components/team/team-directory-card.tsx`

**Interfaces:**
- Consumes: `getPublishedPeople(): Promise<PersonEntry[]>` from Task 1 and `PersonEntry` from `app/lib/contentful/types.ts`.
- Produces: a server-rendered `/team` route with person cards linking to `/team/${person.slug}`.

- [X] **Step 1: Write the failing route-structure assertion**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';

test('exposes the canonical team directory route', () => {
  assert.equal(existsSync('app/(site)/team/page.tsx'), true);
});
```

- [X] **Step 2: Run the focused test to verify it fails**

Run: `node --experimental-strip-types --test tests/route-structure.test.ts`

Expected: FAIL because `app/(site)/team/page.tsx` does not exist.

- [X] **Step 3: Implement the card and page**

```tsx
export default function TeamDirectoryCard({ person }: { person: PersonEntry }) {
  return (
    <Link href={`/team/${person.slug}`} className="group relative block min-h-11 overflow-hidden border border-rule bg-paper-raised p-5 text-ink no-underline transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-brass hover:shadow-editorial">
      <span className="grid aspect-[4/3] place-items-center bg-ink font-display text-6xl text-paper">
        {person.name.slice(0, 1)}
      </span>
      <span className="mt-5 block text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brass">{person.title ?? 'Tournament official'}</span>
      <strong className="mt-2 block font-display text-3xl leading-none">{person.name}</strong>
      <span className="mt-4 flex items-center justify-between text-sm text-muted"><span>{[person.federation, person.location].filter(Boolean).join(' · ') || 'ChessNutZ team'}</span><span aria-hidden="true">→</span></span>
    </Link>
  );
}
```

```tsx
export default async function TeamPage() {
  const people = await getPublishedPeople();
  return <main id="main-content"><section className="bg-oxblood text-paper"><p>Meet the people behind the board</p><h1>Our Team</h1></section>{people.length ? <section aria-label="Team members">{people.map((person) => <TeamDirectoryCard key={person.sys.id} person={person} />)}</section> : <p role="status">Our team profiles are being prepared. Please check back soon.</p>}</main>;
}
```

- [X] **Step 4: Run the route test and lint**

Run: `node --experimental-strip-types --test tests/route-structure.test.ts && npm run lint`

Expected: PASS with no ESLint errors.

- [X] **Step 5: Record the route and component change set (no commit: shared dirty worktree)**

```bash
git add 'app/(site)/team/page.tsx' app/components/team/team-directory-card.tsx tests/route-structure.test.ts
git commit -m "feat: add editorial team directory"
```

### Task 3: Move profiles to their canonical Team path and update official links

**Files:**
- Create: `app/(site)/team/[slug]/page.tsx`
- Delete: `app/(site)/people/[slug]/page.tsx`
- Modify: `app/components/events/event-officials.tsx`

**Interfaces:**
- Consumes: `getPublishedPersonBySlug(slug)`, `getPublishedEventsForPerson(personId)`, and event official `PersonEntry` values.
- Produces: `/team/[slug]` profile metadata with a canonical `/team/[slug]` URL; all officials route there.

- [X] **Step 1: Write the failing canonical-route test**

```ts
test('uses team as the canonical person profile route', () => {
  assert.equal(existsSync('app/(site)/team/[slug]/page.tsx'), true);
  assert.equal(existsSync('app/(site)/people/[slug]/page.tsx'), false);
});
```

- [X] **Step 2: Run the focused test to verify it fails**

Run: `node --experimental-strip-types --test tests/route-structure.test.ts`

Expected: FAIL because the profile still exists only at `people/[slug]`.

- [X] **Step 3: Move the profile page and update all profile URLs**

```ts
return getPageMetadata(person?.name ?? 'Tournament official', person?.title, `/team/${slug}`);
```

```tsx
<Link href={`/team/${person.slug}`}>
```

- [X] **Step 4: Run the focused test and TypeScript build**

Run: `node --experimental-strip-types --test tests/route-structure.test.ts && npm run build:isolated`

Expected: PASS; the build route table lists `/team/[slug]` and no `/people/[slug]` route.

- [X] **Step 5: Record canonical route changes (no commit: shared dirty worktree)**

```bash
git add 'app/(site)/team/[slug]/page.tsx' 'app/(site)/people/[slug]/page.tsx' app/components/events/event-officials.tsx tests/route-structure.test.ts
git commit -m "feat: use canonical team profile routes"
```

### Task 4: Add Team navigation, seed settings, verify, and record completion

**Files:**
- Modify: `app/lib/navigation.ts`
- Modify: `tests/navigation.test.ts`
- Modify: `scripts/contentful-zero-touch.js`
- Modify: `specs/001-contentful-tournament-site/tasks.md`

**Interfaces:**
- Consumes: `getPrimaryNavigation(items?)` and the Contentful `siteSettings.navigationConfig.items` seed shape.
- Produces: an `Our Team` text navigation item in fallback and seeded CMS navigation plus a completed task entry.

- [X] **Step 1: Write the failing fallback navigation expectation**

```ts
{ href: '/team', label: 'Our Team', style: 'text' },
```

- [X] **Step 2: Run the navigation test to verify it fails**

Run: `node --experimental-strip-types --test tests/navigation.test.ts`

Expected: FAIL because fallback navigation has no Team item.

- [X] **Step 3: Add `Our Team` after News in fallback and Contentful seed navigation**

```ts
{ href: '/team', label: 'Our Team', style: 'text' },
```

```js
{ label: 'Our Team', href: '/team', style: 'text', enabled: true },
```

- [X] **Step 4: Publish the seeded navigation only after the code verifies**

Run: `npm run contentful:sync`

Expected: Contentful reports an updated `siteSettings` entry.

- [X] **Step 5: Run the isolated verification suite and record completion**

Run: `npm run verify:isolated`

Expected: tests, ESLint, and the isolated production build pass; then append and mark the Team-directory task complete in `specs/001-contentful-tournament-site/tasks.md`.

- [X] **Step 6: Record completion changes (no commit: shared dirty worktree)**

```bash
git add app/lib/navigation.ts tests/navigation.test.ts scripts/contentful-zero-touch.js specs/001-contentful-tournament-site/tasks.md
git commit -m "feat: add team navigation"
```
