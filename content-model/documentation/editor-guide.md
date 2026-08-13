# Editor guide

Create an Event for each tournament and fill in the title and a unique, URL-safe slug
first. Add the summary, date, location, format, schedule, eligibility, prize details,
and registration URL when available. Empty optional fields are intentionally hidden on
the public page.

For the homepage, update the Landing Page with slug `home`. Use its hero fields for the
opening message, select published featured events, and arrange Section Block references
in the order visitors should see them. A block should use one supported `blockType` and
only the fields that type needs. Publish referenced events and assets before publishing
the Landing Page.

Use Site Settings for the site name, default metadata, footer copy, and `navigationConfig` primary
navigation. Navigation items must use internal paths beginning with `/`; mark an item
enabled only when its destination is ready. Do not place secrets, internal operational
notes, or duplicate event details in public fields.
