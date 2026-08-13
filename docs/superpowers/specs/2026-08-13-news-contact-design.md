# News and Contact Design

## News

Contentful gains a `news` type with title, slug, summary, published date, tags, and Rich Text content. Published entries appear in an editorial `/news` index and `/news/[slug]` detail route. The official `@contentful/rich-text-react-renderer` preserves author formatting on the detail route. Three seeded announcements provide a working editor example.

## Contact

`/contact` provides name, email, subject, and message inputs with accessible browser validation. Until a mail backend exists, a valid submission is stored in local storage and the visitor sees a clear delivery-pending message. The UI remains isolated from transport details so a future server action can replace the draft save.

## Footer

The footer becomes a dark editorial closing panel with a brand statement, Explore and Information link groups, and an accessible legal row. News and Contact are permanent navigation destinations.
