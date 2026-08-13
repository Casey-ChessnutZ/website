# Implementation Plan: Contentful Tournament Site

**Branch**: `[001-contentful-tournament-site]` | **Date**: 2026-08-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-contentful-tournament-site/spec.md`

## Summary

Build a public chess tournament website where the homepage and event pages are rendered from Contentful content models. The design uses reusable homepage sections, a dedicated event content type for tournament pages, and Contentful MCP support so an LLM can inspect content types and entries directly. The implementation is a greenfield Next.js web app deployed on Vercel.

## Technical Context

**Language/Version**: TypeScript with React and Next.js

**Primary Dependencies**: Next.js, React, Contentful, Contentful MCP tooling, Vercel deployment tooling

**Storage**: Contentful is the source of truth for content; no application-owned persistent database in v1

**Testing**: Content model validation, route rendering checks, and end-to-end smoke validation for homepage and event pages

**Target Platform**: Web browsers, preview environments, and Vercel production deployment

**Project Type**: Web application

**Performance Goals**: Public pages should feel fast on repeat navigation and remain responsive while loading content-driven sections

**Constraints**: Content must remain editable in Contentful without code changes; optional fields and unpublished entries must fail gracefully

**Scale/Scope**: One marketing homepage, one event detail template, shared site settings, and modular homepage sections

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No active project constitution is defined beyond the template, so there are no additional governance gates to enforce for this planning pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-contentful-tournament-site/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── content-model.md
    └── routes.md
```

### Source Code (repository root)

```text
app/
├── (site)/
│   ├── page.tsx
│   ├── events/
│   │   └── [slug]/page.tsx
│   └── layout.tsx
├── components/
│   ├── content/
│   ├── events/
│   └── shared/
├── lib/
│   ├── contentful/
│   ├── mcp/
│   └── seo/
└── styles/

content-model/
├── schemas/
└── documentation/

tests/
├── contract/
├── integration/
└── smoke/
```

**Structure Decision**: Use a single Next.js web application with route-level rendering for the homepage and event pages, shared UI components for reusable content blocks, and a content-model documentation area for Contentful schema references and editor guidance.

## Complexity Tracking

> Fill only if a later constitution introduces justified exceptions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
