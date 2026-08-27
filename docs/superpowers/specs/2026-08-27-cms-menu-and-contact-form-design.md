# CMS Menu and Contact Form Design

## Goal

Replace the existing flat site navigation with a six-column editorial menu,
seed its destinations in Contentful, and make the Contact Us form
editor-configurable and capable of delivering submissions by email.

## Navigation

Site Settings remains the one global navigation entry. Its `navigationConfig`
object gains an optional `groups` array. Each group contains a label, an
optional href, and child items containing labels and internal/external hrefs.
The existing `items` array remains supported as a fallback until the CMS seed
has been run.

The new group structure is:

| Group | Children | Destination |
| --- | --- | --- |
| About | About Me; FAQ | `/page/about-me`; `/page/faq` |
| Photos | Album | `/#album` |
| Tournament Calendar | Excel Spreadsheet | `/page/tournament-calendar` |
| Coaching | Rates; Coaches | `/page/rates`; `/page/coaches` |
| Tournaments | Register; Tournament Results; DGT Links | `/page/tournament-register`; `/page/tournament-results`; `/page/dgt-links` |
| Contact Us | Form; Newsletter | `/contact`; `/news` |

Desktop navigation displays a trigger for groups with children and an
accessible dropdown panel. Keyboard focus can enter the panel and Escape
closes it. On mobile, each group becomes an expandable section in the existing
mobile menu; selecting a child closes the menu. The parent remains a label,
not a duplicate destination, because all requested destinations are child
items.

The homepage gallery receives `id="album"`, making Album a reliable landing
page anchor.

## Contentful content

Existing `page` entries provide the requested normal pages. The seed script
upserts sample rich-text content for About Me, FAQ, Tournament Calendar, Rates,
Coaches, Tournament Register, Tournament Results, and DGT Links. The Calendar
page is seeded with an editor-visible Excel spreadsheet placeholder; it is not
presented as a live external schedule until its real URL is supplied.

A new singleton `contactForm` type defines one public form. It has required
`title`, `intro`, `successMessage`, and `fields`; an optional `recipientLabel`
is display-only. `fields` is an array of objects with `id`, `label`, `type`,
`required`, `placeholder`, and `helpText`. Supported field types are `text`,
`email`, `tel`, `select`, and `textarea`; select fields may supply an `options`
array. A seeded form includes name, email, subject, and message.

The contact page fetches this singleton. If the CMS is unavailable it renders
the existing safe fallback fields; it never fabricates an email delivery
success.

## Email delivery

`POST /api/contact` accepts a submission for the published Contact Form,
re-fetches the form definition server-side, validates only the declared field
shape, and applies basic length and email checks. It uses Resend and a React
Email component to send a readable submission email.

The route needs all of the following environment variables:

```
RESEND_API_KEY
CONTACT_EMAIL_FROM
CONTACT_EMAIL_TO
```

They are server-only and absent configuration returns a non-sensitive `503`
response. The browser shows a configuration-unavailable state, not a submitted
state. Send failures return a generic error and do not expose provider details.
The API is rate limited with a conservative in-memory per-IP guard; the route
also includes a honeypot field so ordinary bot submissions are discarded before
Resend is called. A durable shared rate-limit service can replace that guard
when the site is deployed across multiple instances.

## Components and boundaries

- `app/lib/navigation.ts`: normalizes legacy and grouped navigation settings.
- `app/components/shared/site-header.tsx`: purely presents accessible desktop
  dropdowns and mobile disclosure controls from normalized groups.
- `content-model/schemas/contact-form.schema.json`: editor contract for the
  public contact form.
- `app/lib/contentful/queries.ts` and types: fetch and map the singleton form.
- `app/components/contact/contact-form.tsx`: renders CMS fields and submits to
  the API; it owns browser state but no Resend credentials.
- `app/api/contact/route.ts`: server-only validation, anti-abuse handling, and
  Resend delivery.
- `emails/contact-submission.tsx`: React Email template, receiving validated
  values only.
- `scripts/contentful-zero-touch.js`: upserts the type, form seed, content
  pages, and grouped Site Settings menu.

## Verification

Tests cover navigation normalization, the Contentful form mapping, submission
validation and configuration/error paths, and seeded menu destinations. Lint
and the offline isolated production build verify TypeScript, component
rendering, and Next.js route compilation. Delivery to Resend requires valid
sender and recipient configuration and is verified separately after those
environment variables are supplied.
