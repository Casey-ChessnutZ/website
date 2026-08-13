# Tasks: Contentful Tournament Site

**Input**: Design documents from `/specs/001-contentful-tournament-site/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline workspace structure

- [X] T001 Initialize the Next.js application with the app shell and starter route files in `package.json`, `next.config.*`, `app/layout.tsx`, `app/page.tsx`, and `app/globals.css`, connect the first Contentful client in `app/lib/contentful/client.ts`, and configure the Contentful MCP workflow in `.vscode/mcp.json`
- [X] T002 Add the baseline project configuration files for TypeScript, linting, formatting, and environment variables at `tsconfig.json`, `eslint.config.*`, `prettier.config.*`, `.env.example`, `.env.local`, and `.gitignore`
- [X] T003 [P] Create the initial documentation folders and starter files for Contentful modeling and site validation in `content-model/documentation/`, `content-model/schemas/`, and `specs/001-contentful-tournament-site/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared content and rendering infrastructure required before any user story work
**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define shared TypeScript content types for the Landing Page, Event, and reusable section blocks in `app/lib/contentful/types.ts` and create the Contentful schema files for `content-model/schemas/landing-page.schema.json`, `content-model/schemas/event.schema.json`, and `content-model/schemas/section-block.schema.json`
- [X] T005 [P] Implement Contentful fetch helpers and route lookup utilities for the homepage Landing Page entry in `app/lib/contentful/client.ts` and `app/lib/contentful/queries.ts`
- [X] T006 [P] Implement shared SEO and metadata helpers in `app/lib/seo/metadata.ts`
- [X] T007 Create the global site layout and shared shell for the app in `app/(site)/layout.tsx`
- [X] T008 Document the shared Contentful connection, environment variables, and MCP usage assumptions in `content-model/documentation/mcp-setup.md`, `.env.example`, and `.env.local`
- [X] T009 Document the content model contract and route expectations in `content-model/documentation/model-contract.md`, `content-model/documentation/routes.md`, and `content-model/documentation/editor-guide.md` using the approved schemas from `contracts/content-model.md` and `contracts/routes.md`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse tournaments (Priority: P1) 🎯 MVP

**Goal**: Deliver a content-driven homepage that renders the published Landing Page entry and its reusable blocks.

**Independent Test**: Open the homepage with a published Landing Page entry and verify it shows the configured reusable blocks, featured content, and navigation into event detail pages.

### Implementation for User Story 1

- [X] T010 [P] [US1] Build the homepage content renderer in `app/(site)/page.tsx` to read the primary published Landing Page entry and section references
- [X] T011 [P] [US1] Implement the hero block component in `app/components/content/hero-block.tsx` for the Landing Page hero section
- [X] T012 [P] [US1] Implement the image gallery block component in `app/components/content/image-gallery-block.tsx` for grouped media display
- [X] T013 [P] [US1] Implement the timeline block component in `app/components/content/timeline-block.tsx` for chronological tournament or story content
- [X] T014 [P] [US1] Implement the CTA block component in `app/components/content/cta-block.tsx` for action-focused callouts
- [X] T015 [P] [US1] Implement the countdown block component in `app/components/content/countdown-block.tsx` for event timing emphasis
- [X] T016 [P] [US1] Implement the image block component in `app/components/content/image-block.tsx` for standalone visual sections
- [X] T017 [P] [US1] Implement the card block component in `app/components/content/card-block.tsx` for grid-based content highlights
- [X] T018 [US1] Create the dynamic block registry and render pipeline in `app/components/content/block-registry.tsx` and `app/components/content/render-blocks.tsx` so Landing Page blocks are dispatched by type
- [X] T019 [US1] Add homepage data mapping and block source resolution in `app/lib/contentful/queries.ts`
- [X] T020 [US1] Wire homepage metadata and SEO defaults into `app/(site)/page.tsx` using `app/lib/seo/metadata.ts`
- [X] T021 [US1] Add fallback rendering for missing or unsupported homepage blocks in `app/components/content/`

**Checkpoint**: User Story 1 should be fully functional and independently viewable on the homepage

---

## Phase 4: User Story 2 - View an event page (Priority: P1)

**Goal**: Deliver a dedicated tournament page that renders structured event details from the Event content type.

**Independent Test**: Open a published event route and verify it shows the event title, summary, date, location, and any populated optional sections.

### Implementation for User Story 2

- [X] T022 [P] [US2] Build the event route page in `app/(site)/events/[slug]/page.tsx` to fetch and render a single Event entry
- [X] T023 [P] [US2] Implement the event hero component in `app/components/events/event-hero.tsx` for the tournament header and summary
- [X] T024 [P] [US2] Implement the event overview component in `app/components/events/event-overview.tsx` for key event details and description
- [X] T025 [P] [US2] Implement the event schedule component in `app/components/events/event-schedule.tsx` for agenda and timing content
- [X] T026 [P] [US2] Implement the event location component in `app/components/events/event-location.tsx` for venue and access details
- [X] T027 [P] [US2] Implement the event registration component in `app/components/events/event-registration.tsx` for action links and participation details
- [X] T028 [US2] Add route resolution and published-entry filtering in `app/lib/contentful/queries.ts` for event slugs
- [X] T029 [US2] Add event page metadata generation and social preview support in `app/lib/seo/metadata.ts`
- [X] T030 [US2] Add graceful empty-state handling for missing optional event fields in `app/components/events/`

**Checkpoint**: User Story 2 should be fully functional and independently viewable on `/events/[slug]`

---

## Phase 5: User Story 3 - Update content without code changes (Priority: P2)

**Goal**: Support editor-driven updates in Contentful, including a maintainable MCP-assisted workflow for content model inspection.

**Independent Test**: Publish a content change in Contentful and verify the updated Landing Page or event content appears without modifying application code.

### Implementation for User Story 3

- [X] T031 [P] [US3] Finalize the Contentful event, landing page, section block, and site settings schema documentation in `content-model/schemas/`
- [X] T032 [P] [US3] Create editor-facing guidance for page composition and content governance in `content-model/documentation/editor-guide.md`
- [X] T033 [US3] Add workspace-level Contentful MCP usage notes for LLM-assisted content inspection in `content-model/documentation/mcp-setup.md`
- [X] T034 [US3] Add a content publishing validation checklist for preview and production parity in `content-model/documentation/publishing-checklist.md`
- [X] T035 [US3] Confirm the app uses the same content contract for preview and production content resolution in `app/lib/contentful/client.ts`

**Checkpoint**: Content changes should flow through Contentful without code changes, and MCP-assisted inspection should be documented

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T036 [P] Tighten shared UI polish, spacing, and responsive behavior across `app/components/`
- [X] T037 [P] Add final documentation updates for the homepage and event page content model in `content-model/documentation/`
- [X] T038 Verify the quickstart scenarios in `specs/001-contentful-tournament-site/quickstart.md` — validated 2026-08-13 against the configured Contentful space: Event, Landing Page, Section Block, and Site Settings types exist; the published `home` entry resolves its supporting sections and featured events; and the published Melbourne Open example exposes required and optional fields. Workspace MCP configuration is present for model inspection.
- [X] T039 Review route and content fallbacks for unsupported or unpublished Contentful entries in `app/(site)/`

---

## Phase 7: Content examples & isolated verification

- [X] T040 Add structured section-content mapping and rich-text event-description handling in `app/lib/contentful/mapping.ts` and `app/lib/contentful/queries.ts`.
- [X] T041 Seed the published `home` Landing Page with editorial, countdown, card, timeline, and CTA blocks plus three featured events in `scripts/contentful-zero-touch.js`.
- [X] T042 Seed and validate the published `/events/melbourne-open-2026` example with event overview, schedule, location, and registration content.
- [X] T043 Keep the redesigned site route tree unambiguous and run offline verification in `.next-isolated/` without modifying the live development build output.
- [X] T044 Migrate the presentational layer to Tailwind CSS v4 while preserving the Contentful site behavior, accessibility, and isolated verification workflow.
- [X] T045 Format all visible event dates with a consistent, friendly Australia/Melbourne locale label instead of raw Contentful UTC timestamps.
- [X] T046 Add Event divisions and pairing URL support, seed the published 2026 Koshnitsky Cup major event with Major, Minor, and Rookies division examples, and validate Delivery API resolution.
- [X] T047 Add Contentful-driven News list/detail pages, a locally saved contact-form draft ready for email delivery, and an editorial footer linking News and Contact.
- [X] T048 Render News article content with Contentful's official React Rich Text renderer so editor formatting is preserved.
- [X] T049 Add News to the responsive primary navigation in both the safe fallback and seeded Site Settings configuration.
- [X] T050 Add Contentful ISR cache tags and a signed, type- and slug-aware webhook endpoint for on-demand data and route revalidation.
- [X] T051 Redesign the tournament calendar cards as responsive editorial tickets with date panels, metadata, accessible full-card links, and reduced-motion-safe interactions.
- [X] T052 Redesign event detail pages as Contentful-driven tournament dossiers with venue maps, structured schedules, and linked person profiles for officials.
- [X] T053 Add a Contentful-driven, responsive editorial Our Team directory at `/team`, with canonical `/team/[slug]` profiles and primary navigation access.
- [X] T054 Migrate Event venue coordinates to Contentful’s native `venueLocation` field, update map rendering, and omit legacy latitude/longitude fields from delivery responses.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies - can start immediately
- **Phase 2**: Depends on Phase 1 completion - blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 2 completion
- **Phase 5 (US3)**: Depends on Phase 2 completion and benefits from Phase 3/4 contracts
- **Phase 6**: Depends on completion of the desired user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundation; no dependency on event page implementation
- **User Story 2 (P1)**: Can start after Foundation; may reuse shared content helpers but remains independently testable
- **User Story 3 (P2)**: Can start after Foundation; primarily validates documentation, Contentful workflow, and preview/production consistency

### Within Each User Story

- Shared content helpers before page-specific rendering
- Page rendering before metadata and fallback refinement
- Documentation and workflow validation before cross-cutting polish

### Parallel Opportunities

- T003 can run in parallel with other setup documentation work
- T005 and T006 can run in parallel during foundation work
- T010 and T011 can run in parallel for the homepage implementation
- T015 and T016 can run in parallel for the event page implementation
- T020 and T021 can run in parallel for content documentation work

---

## Parallel Example: User Story 1

```bash
Task: "Build the homepage content renderer in app/(site)/page.tsx to read the Landing Page entry and section references"
Task: "Implement reusable homepage section components in app/components/content/ for featured events, editorial text, banner callouts, and stats blocks"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the homepage independently using `specs/001-contentful-tournament-site/quickstart.md`
5. Deploy or demo the homepage if ready

### Incremental Delivery

1. Complete Setup + Foundational
2. Deliver User Story 1 as the MVP homepage experience
3. Add User Story 2 for tournament detail pages
4. Add User Story 3 for editor workflow and MCP support
5. Finish with polish and cross-cutting cleanup

### Parallel Team Strategy

With multiple developers:

1. One developer completes the setup and foundation slices
2. Another builds homepage rendering for User Story 1
3. Another builds event page rendering for User Story 2
4. Another owns the documentation and MCP workflow for User Story 3

---

## Notes

- [P] tasks can run in parallel when they touch different files and have no blocking dependency
- Story labels map each task to a single user story for traceability
- The task list is intentionally MVP-first so the homepage can ship before the full content workflow polish
