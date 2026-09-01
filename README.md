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

Zero-touch always creates missing seed entries but will not overwrite or delete existing editor-managed entries by default. To deliberately permit seed updates for a content type, list it in `CONTENTFUL_UPSERT_CONTENT_TYPES`:

```env
# Default: create only; do not update existing editor content
CONTENTFUL_UPSERT_CONTENT_TYPES=

# Allow only Contact Form and event seed entries to update existing content
CONTENTFUL_UPSERT_CONTENT_TYPES=contactForm,event
```

Legacy `sectionBlock` cleanup also requires `sectionBlock` in this allow-list.
