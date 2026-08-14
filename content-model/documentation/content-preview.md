# Content preview

The site uses Next.js Draft Mode for private, editor-only previews. Published visitors
continue to receive Content Delivery API content through the existing ISR cache.

## Environment variables

Configure these server-only variables locally and in Vercel:

| Variable | Purpose |
| --- | --- |
| `CONTENTFUL_PREVIEW_ACCESS_TOKEN` | Contentful Content Preview API token from **Settings → API keys**. |
| `CONTENTFUL_PREVIEW_SECRET` | A long random value used only to activate preview mode. |

Keep `CONTENTFUL_ACCESS_TOKEN` as the separate Delivery API token. Do not expose either
token or the secret with a `NEXT_PUBLIC_` prefix.

## Contentful preview URL

Use the same deployed-site URL for every selected Contentful content type:

```text
https://<site-host>/api/preview?secret=<CONTENTFUL_PREVIEW_SECRET>&entryId={entry.sys.id}
```

Contentful replaces `{entry.sys.id}` with the selected entry ID. The site resolves the draft
entry through the Preview API and maps its content type and slug to the correct route:
Events, News, People, Pages, Landing Pages, Site Settings, and homepage blocks are supported.
No editor-managed `path`, `contentType`, or duplicate routing field is required.

When active, the site shows a **Previewing draft content** notice. Exit through that notice,
or navigate to:

```text
https://<site-host>/api/preview/exit?path=/
```

## Vercel deployments

Add both variables to the Preview and Production environments that editors will use, then
redeploy. If Vercel Deployment Protection is enabled, enable **Protection Bypass for
Automation** and follow Contentful's Vercel preview URL guidance to append the generated
Vercel bypass token. This is required for Contentful to reach a protected deployment.

## Behaviour

- Draft Mode uses `preview.contentful.com`, the preview token, and `cache: no-store`.
- Normal requests use `cdn.contentful.com`, cache tags, and the current `3600` second
  revalidation policy.
- Content publishing webhooks remain responsible for invalidating published ISR data;
  preview content is always fetched fresh and does not need a webhook.
