# Event dossier editor guide

## People

Use the **Person** content type for organisers, chief arbiters, arbiters, and other tournament officials. Add a unique slug, role title, optional FIDE profile URL, short biography, photo, federation, and location. Add these entries to an event's **Officials** field in the intended display order.

## Venue

For an event dossier, provide the venue name, full street address, a **Venue Location** pin, and any useful arrival notes. Contentful’s native Location editor stores the latitude and longitude together; the address remains visible even when a map cannot load.

## Structured schedule

The **Schedule Timeline** field is a JSON Object. Enter an object with an `items` array; every item needs a `time` and `title`, and may include a `detail`. Do not use the legacy **Schedule Items** field for new entries.

```json
{
  "items": [
    {
      "time": "Saturday · 9:00am",
      "title": "Registration",
      "detail": "Collect player details at the foyer."
    },
    {
      "time": "Saturday · 10:00am",
      "title": "Round 1"
    }
  ]
}
```

## Google Maps

Set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY` in the web application's environment to enable the embedded map. Restrict that key to the Maps Embed API and the production and preview site referrers in Google Cloud. Without a key, the event page retains its venue address and directions link.

## Documents & media

Upload and publish PDFs, images, videos, or other event resources in the Contentful Media library, then add them to the Event’s **Documents & Media** field in the intended display order. Add an asset title for the visible card heading and a description to explain its use, such as “Read before registering” or “Venue arrival guide”. The event page automatically presents file type, file size, and a download action; it does not render an empty section when no assets are attached.
