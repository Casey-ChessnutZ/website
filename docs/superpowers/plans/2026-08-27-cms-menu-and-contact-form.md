# CMS Menu and Contact Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide the requested grouped CMS navigation, seeded destination pages, and a Contentful-defined contact form that sends validated submissions through Resend.

**Architecture:** Site Settings will store normalized navigation groups while retaining the existing flat-item fallback. Contentful supplies all public page/form definitions; the browser only renders those definitions and posts values to a server route. The server route re-fetches and validates the published form before calling Resend with a React Email template.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Contentful Delivery/Management APIs, Resend, React Email, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-27-cms-menu-and-contact-form-design.md`

## Global Constraints

- Preserve all existing user changes and leave this feature uncommitted.
- All Resend secrets and recipient addresses stay server-only in environment variables.
- Use `RESEND_API_KEY`, `CONTACT_EMAIL_FROM`, and `CONTACT_EMAIL_TO` exactly.
- Support only `text`, `email`, `tel`, `select`, and `textarea` CMS field types.
- Keep the existing flat Site Settings navigation as a fallback.
- The Calendar seed must label its spreadsheet link as a placeholder until a live URL is supplied.
- An absent email configuration returns a clear `503`; it must never show a sent confirmation.
- Verify delivery through Resend only after valid environment values are supplied.

---

### Task 1: Normalize grouped CMS navigation

**Files:**
- Modify: `app/lib/navigation.ts`
- Modify: `app/lib/contentful/types.ts`
- Test: `tests/navigation.test.ts`

**Interfaces:**
- Consumes: `SiteSettingsEntry.navigationConfig` from `app/lib/contentful/types.ts`.
- Produces: `NavigationGroup`, `NavigationLink`, and `getNavigationGroups(config)` for the header.

- [ ] **Step 1: Write failing navigation-normalization tests**

```ts
test('normalizes enabled grouped navigation children and keeps internal routes only', () => {
  assert.deepEqual(
    getNavigationGroups({
      groups: [{ label: 'About', enabled: true, items: [
        { label: 'About Me', href: '/page/about-me', enabled: true },
        { label: 'Ignore', href: 'https://example.com', enabled: true },
      ] }],
    }),
    [{ label: 'About', items: [{ label: 'About Me', href: '/page/about-me' }] }],
  );
});

test('converts legacy flat items into one-link groups', () => {
  assert.deepEqual(
    getNavigationGroups({ items: [{ label: 'News', href: '/news', enabled: true, style: 'text' }] }),
    [{ label: 'News', href: '/news', items: [] }],
  );
});
```

- [ ] **Step 2: Run the navigation tests to verify they fail**

Run: `node --experimental-strip-types --test tests/navigation.test.ts`

Expected: failure because `getNavigationGroups` and the group type do not exist.

- [ ] **Step 3: Add typed group and item definitions plus minimal normalization**

```ts
export type NavigationGroup = { label: string; href?: string; items: NavigationLink[] };
export type NavigationLink = { label: string; href: string };

export function getNavigationGroups(config?: NavigationConfig): NavigationGroup[] {
  const groups = config?.groups?.flatMap((group) => {
    if (!group.enabled || !group.label?.trim()) return [];
    const items = (group.items ?? []).flatMap((item) =>
      item.enabled && item.label?.trim() && item.href?.startsWith('/')
        ? [{ label: item.label.trim(), href: item.href }]
        : [],
    );
    return items.length || group.href?.startsWith('/')
      ? [{ label: group.label.trim(), href: group.href, items }]
      : [];
  });
  return groups?.length ? groups : getPrimaryNavigation(config?.items).map((item) => ({ ...item, items: [] }));
}
```

- [ ] **Step 4: Run the navigation tests to verify they pass**

Run: `node --experimental-strip-types --test tests/navigation.test.ts`

Expected: all navigation tests pass.

### Task 2: Render accessible grouped navigation

**Files:**
- Modify: `app/components/shared/site-header.tsx`
- Modify: `app/(site)/layout.tsx`
- Test: `tests/site-header-navigation.test.ts`

**Interfaces:**
- Consumes: `NavigationGroup[]` from `getNavigationGroups`.
- Produces: a header with desktop dropdown triggers and mobile disclosure controls.

- [ ] **Step 1: Write failing component-contract tests**

```ts
test('header exposes a menu button for navigation groups with children', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'app/components/shared/site-header.tsx'), 'utf8');
  assert.match(source, /aria-haspopup="menu"/);
  assert.match(source, /aria-expanded=/);
  assert.match(source, /onKeyDown/);
});

test('site layout supplies normalized navigation groups to the shared header', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'app/\\(site\\)/layout.tsx'), 'utf8');
  assert.match(source, /getNavigationGroups/);
});
```

- [ ] **Step 2: Run the header tests to verify they fail**

Run: `node --experimental-strip-types --test tests/site-header-navigation.test.ts`

Expected: failure because the header receives flat items and renders no menu trigger.

- [ ] **Step 3: Implement disclosure state and menu behavior**

```tsx
const [openGroup, setOpenGroup] = useState<string | null>(null);

<button
  aria-expanded={openGroup === group.label}
  aria-haspopup="menu"
  onClick={() => setOpenGroup((open) => open === group.label ? null : group.label)}
  onKeyDown={(event) => { if (event.key === 'Escape') setOpenGroup(null); }}
>
  {group.label}
</button>
```

Render each child as a `Link`; use `role="menu"`/`role="menuitem"` in the desktop panel. On mobile, use the same controlled state to show child links in a vertically expanded section. Close `openGroup` and `isOpen` when a link is selected or Escape is pressed.

- [ ] **Step 4: Switch the layout to normalized groups**

```tsx
<SiteHeader siteName={siteName} groups={getNavigationGroups(settings.navigationConfig)} />
```

- [ ] **Step 5: Run the header tests to verify they pass**

Run: `node --experimental-strip-types --test tests/site-header-navigation.test.ts`

Expected: all header-navigation tests pass.

### Task 3: Add the Contentful contact-form contract and query

**Files:**
- Create: `content-model/schemas/contact-form.schema.json`
- Modify: `app/lib/contentful/types.ts`
- Modify: `app/lib/contentful/queries.ts`
- Test: `tests/contact-form-contentful.test.ts`

**Interfaces:**
- Consumes: singleton `contactForm` Contentful entry.
- Produces: `ContactFormDefinition` and `getContactForm(preview?: boolean)`.

- [ ] **Step 1: Write failing schema and mapping tests**

```ts
test('maps an editor-defined select field with its options', () => {
  assert.deepEqual(
    mapContactFormItem({ fields: { title: 'Contact', intro: 'Hello', successMessage: 'Received', fields: [
      { id: 'topic', label: 'Topic', type: 'select', required: true, options: ['Event', 'Coaching'] },
    ] } }),
    { title: 'Contact', intro: 'Hello', successMessage: 'Received', fields: [
      { id: 'topic', label: 'Topic', type: 'select', required: true, options: ['Event', 'Coaching'] },
    ] },
  );
});
```

- [ ] **Step 2: Run the Contentful form tests to verify they fail**

Run: `node --experimental-strip-types --test tests/contact-form-contentful.test.ts`

Expected: failure because the schema, mapper, and query do not exist.

- [ ] **Step 3: Add the schema and typed safe mapper**

Create a `contactForm` schema with `title`, `intro`, `successMessage`, and an object-array `fields` property. In the mapper, drop malformed fields, limit types to the five supported values, trim labels and IDs, and retain select options only when they are non-empty strings.

```ts
export type ContactFormDefinition = {
  title: string;
  intro: string;
  successMessage: string;
  fields: ContactFieldDefinition[];
};

export async function getContactForm(preview = false): Promise<ContactFormDefinition | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulContactFormItem>>(
    'entries', { content_type: 'contactForm', limit: '1' }, contentfulTags('contactForm'), { preview },
  );
  return response?.items?.[0] ? mapContactFormItem(response.items[0]) : null;
}
```

- [ ] **Step 4: Run the Contentful form tests to verify they pass**

Run: `node --experimental-strip-types --test tests/contact-form-contentful.test.ts`

Expected: all form schema/mapping tests pass.

### Task 4: Validate contact submissions independently of the UI

**Files:**
- Create: `app/lib/contact/contact-submission.ts`
- Test: `tests/contact-submission.test.ts`

**Interfaces:**
- Consumes: `ContactFormDefinition` and `unknown` request JSON.
- Produces: `validateContactSubmission(form, payload): { values: Record<string, string> } | { error: string }`.

- [ ] **Step 1: Write failing validation tests**

```ts
const form = {
  title: 'Contact', intro: '', successMessage: 'Thanks',
  fields: [
    { id: 'email', label: 'Email', type: 'email', required: true },
    { id: 'message', label: 'Message', type: 'textarea', required: true },
  ],
};

test('rejects a missing required CMS field', () => {
  assert.deepEqual(validateContactSubmission(form, { email: 'person@example.com' }), { error: 'Message is required.' });
});

test('rejects an invalid email before delivery', () => {
  assert.deepEqual(validateContactSubmission(form, { email: 'not-an-email', message: 'Hello' }), { error: 'Enter a valid email address.' });
});
```

- [ ] **Step 2: Run the validation tests to verify they fail**

Run: `node --experimental-strip-types --test tests/contact-submission.test.ts`

Expected: failure because the validation module does not exist.

- [ ] **Step 3: Implement bounded validation**

```ts
export function validateContactSubmission(form: ContactFormDefinition, payload: unknown) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { error: 'Invalid form submission.' };
  const source = payload as Record<string, unknown>;
  const values: Record<string, string> = {};
  for (const field of form.fields) {
    const value = typeof source[field.id] === 'string' ? source[field.id].trim() : '';
    if (field.required && !value) return { error: `${field.label} is required.` };
    if (field.type === 'email' && value && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) return { error: 'Enter a valid email address.' };
    if (value.length > 5000) return { error: `${field.label} is too long.` };
    values[field.id] = value;
  }
  return { values };
}
```

- [ ] **Step 4: Run the validation tests to verify they pass**

Run: `node --experimental-strip-types --test tests/contact-submission.test.ts`

Expected: all validation tests pass.

### Task 5: Add Resend and the React Email delivery boundary

**Files:**
- Modify: `package.json`
- Create: `emails/contact-submission.tsx`
- Create: `app/lib/contact/contact-mailer.ts`
- Test: `tests/contact-mailer.test.ts`

**Interfaces:**
- Consumes: validated values, the form definition, and server environment variables.
- Produces: `sendContactSubmission(form, values)` with `sent`, `unavailable`, and `failed` outcomes.

- [ ] **Step 1: Install the server mail and template dependencies**

Run: `npm install resend @react-email/components react-email`

Expected: `package.json` and lockfile list the three dependencies.

- [ ] **Step 2: Write failing delivery-configuration tests**

```ts
test('reports unavailable without the complete mail configuration', async () => {
  await withEnv({ RESEND_API_KEY: '', CONTACT_EMAIL_FROM: '', CONTACT_EMAIL_TO: '' }, async () => {
    assert.equal(await sendContactSubmission(form, { email: 'person@example.com' }), 'unavailable');
  });
});
```

- [ ] **Step 3: Run the mailer tests to verify they fail**

Run: `node --experimental-strip-types --test tests/contact-mailer.test.ts`

Expected: failure because the delivery boundary does not exist.

- [ ] **Step 4: Implement the template and mailer**

Use React Email primitives (`Html`, `Head`, `Body`, `Container`, `Heading`, `Text`) to render the labels and validated plain-text values. Instantiate `Resend` only when configuration is complete; pass the rendered template to `resend.emails.send({ from, to, replyTo, subject, react })`. Catch provider errors and return `failed` without logging submission values.

- [ ] **Step 5: Run the mailer tests to verify they pass**

Run: `node --experimental-strip-types --test tests/contact-mailer.test.ts`

Expected: all mailer tests pass without making a network request.

### Task 6: Replace the fixed contact UI and add the secure API route

**Files:**
- Modify: `app/(site)/contact/page.tsx`
- Modify: `app/components/contact/contact-form.tsx`
- Create: `app/api/contact/route.ts`
- Test: `tests/contact-route.test.ts`

**Interfaces:**
- Consumes: `getContactForm`, `validateContactSubmission`, and `sendContactSubmission`.
- Produces: `POST /api/contact` and the client form UI.

- [ ] **Step 1: Write failing API outcome tests**

```ts
test('returns 503 when the mail service is not configured', async () => {
  const response = await POST(new Request('http://localhost/api/contact', {
    method: 'POST', body: JSON.stringify({ email: 'person@example.com', message: 'Hello', website: '' }),
  }));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'Contact email is not configured yet.' });
});

test('discards a filled honeypot without sending an email', async () => {
  const response = await POST(new Request('http://localhost/api/contact', {
    method: 'POST', body: JSON.stringify({ website: 'spam' }),
  }));
  assert.equal(response.status, 200);
});
```

- [ ] **Step 2: Run the route tests to verify they fail**

Run: `node --experimental-strip-types --test tests/contact-route.test.ts`

Expected: failure because `POST` does not exist.

- [ ] **Step 3: Implement route protection and outcomes**

Read JSON defensively, reject non-object payloads with `400`, reject a filled `website` honeypot with `200`, and keep a module-level per-IP timestamp array allowing five requests per ten minutes. Fetch the published form, validate declared fields, map `unavailable` to `503`, map `failed` to `502`, and return `{ successMessage }` only after `sent`.

- [ ] **Step 4: Render the CMS definition in the Contact page**

```tsx
const form = await getContactForm();
return <ContactForm definition={form ?? fallbackContactForm} />;
```

Render the five supported field controls from the definition, include an aria-hidden honeypot, disable the submit button while posting, and announce API errors/success through `aria-live="polite"`. Remove the browser-only local-storage delivery claim.

- [ ] **Step 5: Run the route tests to verify they pass**

Run: `node --experimental-strip-types --test tests/contact-route.test.ts`

Expected: all API tests pass.

### Task 7: Seed Contentful and wire all requested destinations

**Files:**
- Modify: `scripts/contentful-zero-touch.js`
- Modify: `app/components/content/image-gallery-block.tsx`
- Test: `tests/contentful-seed-menu.test.ts`

**Interfaces:**
- Consumes: `contact-form.schema.json`, grouped navigation format, existing Page and homepage section seed helpers.
- Produces: published `contactForm`, Pages, homepage Album anchor, and Site Settings group data after `npm run contentful:sync`.

- [ ] **Step 1: Write failing seed-contract tests**

```ts
test('seeds every requested menu destination and the contact form type', () => {
  const seed = fs.readFileSync(path.join(process.cwd(), 'scripts/contentful-zero-touch.js'), 'utf8');
  for (const slug of ['about-me', 'faq', 'tournament-calendar', 'rates', 'coaches', 'tournament-register', 'tournament-results', 'dgt-links']) {
    assert.match(seed, new RegExp(`slug: '${slug}'`));
  }
  assert.match(seed, /contact-form\.schema\.json/);
  assert.match(seed, /groups:/);
});
```

- [ ] **Step 2: Run the seed-contract tests to verify they fail**

Run: `node --experimental-strip-types --test tests/contentful-seed-menu.test.ts`

Expected: failure because the seed omits the contact form type and grouped menu data.

- [ ] **Step 3: Update the deterministic seed data**

Add `contact-form.schema.json` to the model sync. Upsert one `contactForm` singleton with the seeded name, email, subject, and message fields. Extend the Pages array with all eight requested slugs and concise starter copy. Replace Site Settings `navigationConfig.items` with the six named groups and their destinations. Add `id="album"` to the image-gallery section wrapper.

- [ ] **Step 4: Run the seed-contract tests to verify they pass**

Run: `node --experimental-strip-types --test tests/contentful-seed-menu.test.ts`

Expected: all seed-contract tests pass.

### Task 8: Run full local verification and document live-delivery boundary

**Files:**
- Modify: `.env.example` if present, otherwise `README.md`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: reproducible configuration instructions without secrets.

- [ ] **Step 1: Document the three required variables without values**

```dotenv
RESEND_API_KEY=
CONTACT_EMAIL_FROM=
CONTACT_EMAIL_TO=
```

- [ ] **Step 2: Run the complete automated suite**

Run: `npm test && npm run lint && npm run build:isolated`

Expected: tests pass, lint has no errors, and the offline production build completes.

- [ ] **Step 3: Inspect the final scoped diff**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only the planned files plus pre-existing user changes are modified.

## Plan self-review

- Spec coverage: Tasks 1-2 implement desktop/mobile grouped navigation; Task 7 seeds every stated link and the Album anchor; Tasks 3-6 implement CMS form data, validation, Resend/React Email, and client state; Task 8 records configuration and verifies code.
- Placeholder scan: The Calendar’s editor-visible placeholder is an intentional product requirement; every implementation/test step has a concrete command or interface.
- Type consistency: `ContactFormDefinition` starts in Task 3 and is consumed unchanged in Tasks 4-6. `getNavigationGroups` begins in Task 1 and is supplied to the header in Task 2.
