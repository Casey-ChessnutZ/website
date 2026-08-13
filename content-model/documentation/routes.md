# Public routes

| Route | Contentful source | Public behaviour |
| --- | --- | --- |
| `/` | Published `landingPage` with slug `home` | Renders the homepage and ordered blocks. |
| `/events` | Published `event` entries | Shows the event calendar. |
| `/events/[slug]` | One published `event` entry | Renders tournament details; unknown or unpublished slugs return 404. |

Never use an unpublished entry as a public route target. Preview mode uses the same
schemas and route lookup, but reads from the Preview API when explicitly enabled.
