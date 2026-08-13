# Featured Events Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present selected homepage events as a responsive editorial tournament index.

**Architecture:** Keep the existing Featured Events section data contract. Replace only its component markup/styles with a lead-event card and secondary event list using existing event fields.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Node test runner.

## Global Constraints

- Use existing paper, ink, oxblood, brass, and rule tokens.
- Maintain 44px targets, visible focus, and reduced-motion-safe transitions.
- Do not alter Contentful models, mapping, seed data, or caches.

---

### Task 1: Redesign the Featured Events component

**Files:**
- Modify: `app/components/content/featured-events-block.tsx`
- Test: `tests/featured-events-block.test.ts`

**Consumes:** Mapped event title, slug, summary, date, format, and location fields.

**Produces:** Lead card plus numbered responsive event list.

- [ ] **Step 1: Write a failing render-contract test**

```ts
test('uses the first featured event as the lead and renders remaining events in order', () => {
  const html = renderFeaturedEvents([firstEvent, secondEvent]);
  assert.match(html, /Featured event/);
  assert.match(html, /01/);
  assert.match(html, /02/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --experimental-strip-types --test tests/featured-events-block.test.ts`

Expected: FAIL because the current component is an equal-weight grid.

- [ ] **Step 3: Implement lead and list layouts**

Use the first configured event for a bordered lead card with date, title,
summary, details and CTA. Render remaining events as numbered rows. On small
screens use a single column; from `lg` use the asymmetric editorial grid.

- [ ] **Step 4: Verify the test and complete project validation**

Run: `node --experimental-strip-types --test tests/featured-events-block.test.ts && npm run verify:isolated`

Expected: component test, all project tests, lint, and isolated build pass.
