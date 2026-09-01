# Casey Chessnutz website

## Contact form configuration

The Contact Form entry in Contentful owns the recipient address. Set and publish its **Recipient email** field; it is read only on the server and is not rendered in the form.

The backend still needs these environment variables:

```env
RESEND_API_KEY=
CONTACT_EMAIL_FROM=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

`CONTACT_EMAIL_TO` is no longer used.

## Zero-touch content updates

Run the interactive selector for normal local Contentful work:

```bash
npm run contentful:sync
```

Use arrow keys to move, Space to select one or more content types, and Enter
to continue. Select whether to sync the content type schema/editor controls,
create missing seeded data, or update selected seeded data. The CLI shows the
scope and requires confirmation before it contacts Contentful. Legacy cleanup
is intentionally not available from this menu.

For CI or scripted use, retain the non-interactive command and pass explicit
environment flags:

```bash
npm run contentful:sync:non-interactive
```

Zero-touch always creates missing seed entries but will not overwrite or delete existing editor-managed entries by default. To deliberately permit seed updates for a content type, list it in `CONTENTFUL_UPSERT_CONTENT_TYPES`:

```env
# Default: create only; do not update existing editor content
CONTENTFUL_UPSERT_CONTENT_TYPES=

# Allow only Contact Form and event seed entries to update existing content
CONTENTFUL_UPSERT_CONTENT_TYPES=contactForm,event
```

Legacy `sectionBlock` cleanup also requires `sectionBlock` in this allow-list.
