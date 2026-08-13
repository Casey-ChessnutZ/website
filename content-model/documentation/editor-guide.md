# Editor guide

Create an Event for each tournament and enter its title first; Contentful automatically suggests a URL-safe slug from that title. Review the suggested slug before publishing, then add the summary, date, location, format, schedule, eligibility, prize details,
and registration URL when available. Empty optional fields are intentionally hidden on
the public page.

The same automatic slug editor is configured for Event, News, Person, Landing Page, and Section Block entries. It derives slugs from `title`, except Person entries, which derive them from `name`. Editors may still adjust a suggested slug when a distinct URL is required.

For the homepage, update the Landing Page with slug `home`. Use its hero fields for the
opening message, select published featured events, and arrange Section Block references
in the order visitors should see them. A block should use one supported `blockType` and
only the fields that type needs. Publish referenced events and assets before publishing
the Landing Page.

Use Site Settings for the site name, default metadata, footer copy, and `navigationConfig` primary
navigation. Navigation items must use internal paths beginning with `/`; mark an item
enabled only when its destination is ready. Do not place secrets, internal operational
notes, or duplicate event details in public fields.
