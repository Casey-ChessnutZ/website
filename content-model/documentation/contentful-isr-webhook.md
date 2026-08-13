# Contentful ISR webhook

This site caches published Contentful responses for one hour and clears the affected cache entries whenever Contentful publishes, unpublishes, or deletes supported content.

## 1. Add the deployment secret

In Contentful, open **Settings → Webhooks → Settings** and enable **request verification**. Copy the generated signing secret once, then add it to the hosting provider’s server-side environment as:

```text
CONTENTFUL_WEBHOOK_SIGNING_SECRET=<Contentful signing secret>
```

Do not add this value to `NEXT_PUBLIC_*`, commit it, or include it in the webhook URL.

## 2. Configure the webhook

Create a Contentful webhook with these settings:

| Setting | Value |
| --- | --- |
| URL | `https://<production-host>/api/revalidate/contentful` |
| Method | `POST` |
| Triggers | `Entry.publish`, `Entry.unpublish`, `Entry.delete` |
| Request verification | Enabled |

The receiver accepts event, news, landing page, site settings, person, and each focused homepage section/supporting entry type. Add Contentful payload filters for those types if your space contains other entry types; otherwise the receiver safely acknowledges them without clearing cache.

## 3. What is invalidated

| Content type | Data tags | Routes |
| --- | --- | --- |
| Event | `contentful:event`, `contentful:event:<slug>` | Home, event list, matching event route, all dynamic event routes |
| News | `contentful:news`, `contentful:news:<slug>` | News list, matching article route, all dynamic article routes |
| Landing Page / Homepage section | matching type and slug tags | Home |
| Site Settings | `contentful:siteSettings` | Root layout |

Contentful delete payloads can omit fields such as `slug`. The webhook still clears the matching content-type tag and dynamic route pattern so a deleted event or article is not retained in the cache.

## 4. Verify after deployment

1. Publish a test News or Event entry in Contentful.
2. Check **Settings → Webhooks → Activity** for an HTTP 200 response from the endpoint.
3. Load the corresponding site page. The first request may use stale-while-revalidate semantics; the following request receives fresh data.

If the response is HTTP 401, confirm request verification is enabled in Contentful and the production `CONTENTFUL_WEBHOOK_SIGNING_SECRET` is the current signing secret. If it is HTTP 503, the deployment environment does not have the variable.
