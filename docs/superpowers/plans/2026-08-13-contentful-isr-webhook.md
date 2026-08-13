# Contentful ISR Webhook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add type- and slug-scoped Next.js cache tags and a signed Contentful webhook that invalidates the right data and routes.

**Architecture:** The Contentful client passes deterministic tags to Next.js `fetch`, while a pure cache-plan module maps an incoming Contentful entry payload to tags and routes. A route handler authenticates Contentful’s HMAC-signed webhook, calls `revalidateTag` and `revalidatePath`, and returns only non-sensitive cache-plan metadata.

**Tech Stack:** Next.js App Router 15, TypeScript, Node `crypto`, Contentful Delivery API, Node test runner.

## Global Constraints

- Preserve preview requests as `no-store`.
- Accept only Contentful Entry publish, unpublish, and delete topics for `event`, `news`, `landingPage`, `sectionBlock`, and `siteSettings`.
- Never expose `CONTENTFUL_WEBHOOK_SIGNING_SECRET` or accept a secret through the URL.
- Use `revalidateTag(tag, 'max')` and scoped `revalidatePath` calls.

---

### Task 1: Cache tagging and cache-plan mapping

**Files:**
- Create: `app/lib/contentful/cache-revalidation.ts`
- Modify: `app/lib/contentful/client.ts`
- Modify: `app/lib/contentful/queries.ts`
- Test: `tests/contentful-cache-revalidation.test.ts`

**Interfaces:**
- Produces `contentfulTags(type, slug?)`, `createContentfulRevalidationPlan(payload)`, and `ContentfulRevalidationPlan`.
- `contentfulFetch(path, params, tags)` accepts optional cache tags.

- [X] **Step 1: Write failing tests** for event and delete payloads: event `2026-open` must invalidate `contentful:event`, `contentful:event:2026-open`, `/`, `/events`, `/events/2026-open`, and `/events/[slug]`; a slugless news deletion must include `contentful:news`, `/news`, and `/news/[slug]`.
- [X] **Step 2: Run** `npm test -- tests/contentful-cache-revalidation.test.ts` and confirm the tests fail because the module does not exist.
- [X] **Step 3: Implement** typed tag/path constants and the payload mapper, then attach type and slug tags to each published Contentful query; preserve `no-store` in preview mode.
- [X] **Step 4: Run** `npm test -- tests/contentful-cache-revalidation.test.ts` and confirm it passes.

### Task 2: Signed webhook route

**Files:**
- Create: `app/api/revalidate/contentful/route.ts`
- Create: `app/lib/contentful/webhook-verification.ts`
- Test: `tests/contentful-webhook-verification.test.ts`

**Interfaces:**
- Produces `verifyContentfulWebhook(request, rawBody, signingSecret): Promise<boolean>`.
- Route calls `revalidateTag(tag, 'max')` and `revalidatePath(path, type?)` from Task 1’s plan only after verification succeeds.

- [X] **Step 1: Write failing tests** proving a valid signed webhook passes, a mismatched signature fails, and a timestamp more than five minutes old fails.
- [X] **Step 2: Run** `npm test -- tests/contentful-webhook-verification.test.ts` and confirm the tests fail because the verifier does not exist.
- [X] **Step 3: Implement** HMAC SHA-256 verification with constant-time comparison, strict signed-header normalization, and a five-minute timestamp window; add the POST route with topic/type validation and no sensitive response data.
- [X] **Step 4: Run** `npm test -- tests/contentful-webhook-verification.test.ts` and confirm it passes.

### Task 3: Configuration and verification

**Files:**
- Modify: `.env.example`
- Create: `content-model/documentation/contentful-isr-webhook.md`
- Modify: `specs/001-contentful-tournament-site/tasks.md`

- [X] **Step 1: Document** the exact Contentful webhook endpoint, event filters, request-verification secret, production environment variable, and local signed-request test command.
- [X] **Step 2: Add** `CONTENTFUL_WEBHOOK_SIGNING_SECRET=` to `.env.example` without a value.
- [X] **Step 3: Run** `npm run verify:isolated && git diff --check`; review that no secret is included in the diff.
- [X] **Step 4: Mark** the new ISR/webhook task complete in `tasks.md`.
