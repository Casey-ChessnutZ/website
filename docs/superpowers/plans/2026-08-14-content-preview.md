# Content Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure Contentful Draft Mode preview while retaining cached, ISR-backed published content.

**Architecture:** A dedicated preview utility maps a Contentful entry's actual type and slug to an allow-listed site route. The preview route validates a server-only secret and `{entry.sys.id}`, fetches that entry from the Preview API, then enables Draft Mode. Page/layout server components pass the resulting boolean into Contentful query functions; the fetch helper selects Preview API/no-store or Delivery API/tagged cache based on that explicit value.

**Tech Stack:** Next.js 15 App Router, TypeScript, native Node test runner, Contentful Delivery and Preview REST APIs.

## Global Constraints

- Never expose `CONTENTFUL_PREVIEW_ACCESS_TOKEN` or `CONTENTFUL_PREVIEW_SECRET` to client code.
- Published content must retain existing Contentful cache tags and `revalidate: 3600` behaviour.
- Preview requests must use `https://preview.contentful.com` and `cache: 'no-store'`.
- Work remains uncommitted on `main` as requested by the user.

---

### Task 1: Preview utilities and route handlers

**Files:**
- Create: `app/lib/contentful/preview.ts`
- Create: `app/api/preview/route.ts`
- Create: `app/api/preview/exit/route.ts`
- Test: `tests/contentful-preview.test.ts`

**Interfaces:**
- Produces `getContentfulPreviewPath(contentType, slug): string | null` and `getPreviewRedirectPath(path: string | null): string`.
- Produces `GET(request: Request): Promise<Response>` preview route handlers.

- [X] Write failing tests for allowed site paths, rejected external/API paths, and the safe fallback route.
- [X] Run `npm test -- tests/contentful-preview.test.ts` and confirm the tests fail because the utility is absent.
- [X] Implement the utility and the enable/exit route handlers using `draftMode()`.
- [X] Run `npm test -- tests/contentful-preview.test.ts` and confirm it passes.

### Task 2: Preview-aware Contentful data flow

**Files:**
- Modify: `app/lib/contentful/client.ts`
- Modify: `app/lib/contentful/queries.ts`
- Modify: `app/(site)/layout.tsx`
- Modify: `app/(site)/page.tsx`
- Modify: `app/(site)/events/page.tsx`
- Modify: `app/(site)/events/[slug]/page.tsx`
- Modify: `app/(site)/news/page.tsx`
- Modify: `app/(site)/news/[slug]/page.tsx`
- Modify: `app/(site)/page/[slug]/page.tsx`
- Modify: `app/(site)/team/page.tsx`
- Modify: `app/(site)/team/[slug]/page.tsx`
- Test: `tests/contentful-preview.test.ts`

**Interfaces:**
- `contentfulFetch<T>(path, params, tags, { preview?: boolean })` selects the correct token, host, and cache policy.
- Every Contentful query accepts an optional final `preview = false` parameter.

- [X] Write failing tests that assert explicit preview configuration chooses the preview API/no-store and published configuration chooses the delivery API/tagged cache.
- [X] Run the preview test and confirm the new assertions fail.
- [X] Implement explicit query options and forward Draft Mode from all Contentful-backed site pages and shared layout.
- [X] Run the preview test and confirm it passes.

### Task 3: Configuration, editor guidance, and verification

**Files:**
- Modify: `.env.example`
- Modify: `content-model/documentation/mcp-setup.md`
- Modify: `content-model/documentation/publishing-checklist.md`
- Create: `content-model/documentation/content-preview.md`
- Modify: `specs/001-contentful-tournament-site/tasks.md`

- [X] Replace the global preview switch with `CONTENTFUL_PREVIEW_SECRET` in environment examples.
- [X] Document Contentful preview URLs, safe entry-path mapping, Vercel Deployment Protection, and leaving preview mode.
- [X] Mark the preview task complete only after `npm run verify:isolated` exits successfully.
