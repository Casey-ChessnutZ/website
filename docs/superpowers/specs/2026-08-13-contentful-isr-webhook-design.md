# Contentful ISR Webhook Design

## Goal

Keep published Contentful content fast through Next.js Data Cache while making published, unpublished, and deleted entries visible without waiting for time-based revalidation.

## Design

Contentful requests receive stable type and slug cache tags. The webhook route verifies Contentful's signed request headers using `CONTENTFUL_WEBHOOK_SIGNING_SECRET`, rejects unknown or stale requests, and applies `revalidateTag(tag, 'max')` and the affected `revalidatePath` calls.

Supported entry types are `event`, `news`, `landingPage`, `sectionBlock`, and `siteSettings`. Event and News changes clear their collection and entry-slug tags. A deletion has no reliable field data, so it also clears the matching dynamic route pattern. Shared Contentful content clears the home path or root layout as appropriate.

## Operational contract

Configure Contentful to POST only `Entry.publish`, `Entry.unpublish`, and `Entry.delete` events for the supported content types to `/api/revalidate/contentful`. Enable Contentful request verification, store the signing secret only in the deployment environment, and do not expose it in browser code or webhook URLs.
