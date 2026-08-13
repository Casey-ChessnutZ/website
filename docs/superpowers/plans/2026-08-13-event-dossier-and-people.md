# Event Dossier and People Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Contentful-driven event dossier with venue mapping, structured schedules, and linked person profiles.

**Architecture:** Contentful entries remain the single source of truth. Queries map linked people and structured event fields into typed UI data. Small server components compose the dossier, while the map is a progressively enhanced iframe with an address-and-directions fallback.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, Contentful Delivery API and Management API.

## Tasks

- [X] T1 Add person and event schema fields; extend seed script with three sample officials and a fully populated Melbourne Open.
- [X] T2 Extend Contentful types, query mappings, cache tags, and webhook routing for people and event officials.
- [X] T3 Add person detail routes and person/event mapping tests.
- [X] T4 Build the redesigned event dossier components: hero, tournament desk, schedule timeline, venue/map, official cards, and responsive section navigation.
- [X] T5 Publish seed content, verify Contentful delivery data, run the isolated build, and update the task list.
