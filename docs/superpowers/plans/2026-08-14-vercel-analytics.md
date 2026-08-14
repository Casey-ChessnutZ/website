# Vercel Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable Vercel Web Analytics in the Next.js site.

**Architecture:** Render the official `Analytics` component once in the root layout, backed by the runtime `@vercel/analytics` dependency.

**Tech Stack:** Next.js 15, React 19, npm.

---

### Task 1: Install and wire Vercel Analytics

**Files:**
- Modify: `package.json`, `package-lock.json`, `app/layout.tsx`

- [ ] **Step 1: Install the official runtime dependency**

Run: `npm install @vercel/analytics`

- [ ] **Step 2: Render analytics once at the root**

```tsx
import { Analytics } from '@vercel/analytics/next';
// inside <body>, after {children}
<Analytics />
```

- [ ] **Step 3: Verify and publish the approved change**

Run: `npm run verify:isolated`, then commit the verified files on `main` and push to `origin/main`.
