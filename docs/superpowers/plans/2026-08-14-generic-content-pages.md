# Generic Content Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish simple evergreen Contentful pages at `/page/{slug}`.

**Architecture:** Add a Page schema, typed Contentful query, editorial route, scoped cache tags/webhook paths, and idempotent examples in the existing sync script.

**Tech Stack:** Next.js, Contentful, TypeScript, Tailwind CSS, Node test runner.

### Task 1: Page model, retrieval, delivery, and ISR

**Files:**
- Create: `content-model/schemas/page.schema.json`, `app/(site)/page/[slug]/page.tsx`
- Modify: `scripts/contentful-zero-touch.js`, `app/lib/contentful/types.ts`, `app/lib/contentful/queries.ts`, `app/lib/contentful/cache-revalidation.ts`, `tests/contentful-cache-revalidation.test.ts`, `content-model/documentation/contentful-isr-webhook.md`
- Test: `tests/page-content.test.ts`

- [ ] Add a failing Page cache/mapper contract test.
- [ ] Add the minimal title/slug/content Page schema and configure slug editor.
- [ ] Implement Page query, `/page/{slug}` rich-text route, and scoped ISR plan.
- [ ] Seed Terms, Privacy, and FAQ pages; run sync after local verification.
- [ ] Run `npm run verify:isolated`, verify live Contentful, and update tasks.
