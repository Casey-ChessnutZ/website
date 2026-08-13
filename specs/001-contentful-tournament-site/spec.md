# Feature Specification: Contentful Tournament Site

**Feature Branch**: `[001-contentful-tournament-site]`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "Create a content-driven ChessNutZ website using React, Next.js, Contentful, Vercel, and Contentful MCP so an LLM can work directly with content and content types. The site needs a dynamic landing page, a dedicated event page content type, reusable components, and best-practice Contentful modeling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse tournaments (Priority: P1)

A visitor opens the site and can quickly find current and upcoming chess tournaments from a content-driven Landing Page entry rendered at the homepage.

**Why this priority**: This is the primary public entry point and delivers immediate value before any deeper event exploration.

**Independent Test**: Load the homepage with a published Landing Page entry and confirm the page displays tournament highlights, featured content blocks, and links to event pages without manual code changes.

**Acceptance Scenarios**:

1. **Given** a published Landing Page entry exists, **When** a visitor opens the homepage, **Then** the page shows a branded tournament overview and event-focused content sections.
2. **Given** the Landing Page entry contains reusable blocks, **When** the visitor scans the homepage, **Then** they see the blocks rendered in the configured order and can navigate to a featured event.

---

### User Story 2 - View an event page (Priority: P1)

A visitor opens a specific chess tournament page and sees structured event details such as date, location, overview, and registration information.

**Why this priority**: Event detail pages are the core content destination and must be reliable for each tournament.

**Independent Test**: Open a published event page and confirm the structured event fields render correctly, including optional sections when present.

**Acceptance Scenarios**:

1. **Given** a published event entry exists, **When** a visitor opens its route, **Then** the page renders the event title, summary, and key details from Contentful.
2. **Given** optional event fields are populated, **When** the visitor opens the page, **Then** the optional content appears in the correct section without requiring a redesign.

---

### User Story 3 - Update content without code changes (Priority: P2)

A content editor updates Landing Page blocks or tournament details in Contentful and expects the site to reflect those changes through the normal publishing flow.

**Why this priority**: The business value depends on content operations being decoupled from code deployment.

**Independent Test**: Publish a change in Contentful and verify the updated content appears in the site output or preview environment without modifying application code.

**Acceptance Scenarios**:

1. **Given** an editor changes a tournament description in Contentful, **When** the entry is published, **Then** the updated description appears on the event page.
2. **Given** an editor adds or reorders Landing Page blocks in Contentful, **When** the content is published, **Then** the homepage reflects the updated block layout without a code change.

---

### Edge Cases

- A referenced event is unpublished or removed from Contentful.
- Optional event fields such as prize information or registration links are missing.
- A Landing Page block is configured in Contentful but not yet supported by the frontend.
- Multiple tournaments have similar names or dates and must still resolve to unique pages.
- Preview or production environments have different published content states.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST provide a homepage that renders a published Landing Page entry.
- **FR-002**: The Landing Page MUST be driven by Contentful content rather than hardcoded page copy.
- **FR-003**: The site MUST provide dedicated, shareable event pages for tournament entries.
- **FR-004**: Event pages MUST render from a dedicated Contentful event content type with a stable slug-based route.
- **FR-005**: The event content type MUST support core tournament information including title, summary, date, location, and publication status.
- **FR-006**: The event content type MUST support optional fields for registration link, venue details, format, schedule, prize information, eligibility, and hero media.
- **FR-007**: The Landing Page content type MUST support reusable page sections so the homepage can be composed from modular blocks.
- **FR-008**: The site MUST handle missing optional fields without breaking page rendering.
- **FR-009**: The site MUST support a content structure that allows adding new section types without rewriting the entire page model.
- **FR-010**: The site MUST support preview and production environments using the same content model.
- **FR-011**: The project MUST expose Contentful content types and content entries to an LLM through Contentful MCP so content-aware workflows can inspect and reason about the model directly.
- **FR-012**: The Contentful model MUST be documented clearly enough that a new editor or LLM-assisted workflow can understand which content type controls the homepage, event pages, and shared site settings.
- **FR-013**: The site MUST be deployable on Vercel.
- **FR-014**: The implementation MUST preserve SEO-friendly public pages for event discovery.

### Key Entities *(include if feature involves data)*

- **Event**: A tournament entry with title, slug, summary, date, location, publication status, and optional event-specific details.
- **Landing Page**: A configurable homepage record with a slug, published state, and ordered block references; multiple entries may exist in Contentful even though the app currently renders the primary homepage entry at `/`.
- **Section Block**: A reusable page component definition used to compose the landing page from Contentful content.
- **Site Settings**: Shared global content for branding, SEO defaults, and common navigation or footer values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can identify an upcoming chess tournament and open its detail page from the homepage in one browsing session.
- **SC-002**: At least 90% of published event entries render correctly with their core fields present and optional fields gracefully omitted when empty.
- **SC-003**: Content editors can publish a change to an event or homepage section without a code change, and the update appears in the site output through the normal content delivery flow.
- **SC-004**: The content model is understandable enough that a new content type or reusable section can be added without restructuring existing pages.
- **SC-005**: The site can be deployed to Vercel and remain usable in both preview and production environments.

## Assumptions

- Contentful is the source of truth for all public site content.
- The first release focuses on public browsing and content presentation, not registration, ticketing, or live event operations.
- The homepage is rendered from the Landing Page content type, and the frontend may still enforce a limited supported set of block types in v1.
- The event content type is the primary content model for tournament detail pages.
- Contentful MCP is used for LLM-assisted inspection and content-aware workflows, not as the public runtime delivery path.
- Vercel will host the production and preview deployments.