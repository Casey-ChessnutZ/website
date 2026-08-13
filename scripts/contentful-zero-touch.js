const contentful = require('contentful-management');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function toFieldDef(field) {
  const base = {
    id: field.id,
    name: field.name,
    type: field.type,
    required: Boolean(field.required),
    localized: Boolean(field.localized),
    validations: field.validations || [],
    disabled: false,
    omitted: false,
  };

  if (field.linkType) {
    base.linkType = field.linkType;
  }

  if (field.items) {
    base.items = field.items;
  }

  return base;
}

async function upsertContentType(client, schemaFile, spaceId, environmentId) {
  const schemaPath = path.join(process.cwd(), 'content-model', 'schemas', schemaFile);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const contentTypeId = schema.sys.id;

  const payload = {
    name: schema.name,
    description: schema.description,
    displayField: schema.displayField,
    fields: (schema.fields || []).map(toFieldDef),
  };

  const existing = await client.contentType
    .get({ contentTypeId, spaceId, environmentId })
    .catch(() => null);
  if (existing) {
    const updateVersion = existing?.sys?.version;
    if (!updateVersion) {
      throw new Error(`Missing version for existing content type: ${contentTypeId}`);
    }

    await client.contentType.update(
      { contentTypeId, spaceId, environmentId },
      {
        ...payload,
        sys: {
          version: updateVersion,
        },
      },
    );
    const refreshed = await client.contentType.get({ contentTypeId, spaceId, environmentId });
    const publishVersion = refreshed?.sys?.version;
    if (!publishVersion) {
      throw new Error(`Missing publish version for content type: ${contentTypeId}`);
    }
    await client.contentType.publish(
      { contentTypeId, spaceId, environmentId },
      {
        ...refreshed,
        sys: {
          ...refreshed.sys,
          version: publishVersion,
        },
      },
    );
    console.log(`Updated and published content type: ${contentTypeId}`);
    return;
  }

  await client.contentType.createWithId(
    { contentTypeId, spaceId, environmentId },
    payload,
  );
  const created = await client.contentType.get({ contentTypeId, spaceId, environmentId });
  const createPublishVersion = created?.sys?.version;
  if (!createPublishVersion) {
    throw new Error(`Missing publish version for newly created content type: ${contentTypeId}`);
  }
  await client.contentType.publish(
    { contentTypeId, spaceId, environmentId },
    {
      ...created,
      sys: {
        ...created.sys,
        version: createPublishVersion,
      },
    },
  );
  console.log(`Created and published content type: ${contentTypeId}`);
}

async function upsertEntryBySlug(client, spaceId, environmentId, contentType, slug, fields) {
  const entryId = `${contentType}--${slug}`.replace(/[^a-zA-Z0-9-_.]/g, '-');
  const existing = await client.entry
    .get({ entryId, spaceId, environmentId })
    .catch(() => null);

  if (existing) {
    const updateVersion = existing?.sys?.version;
    if (!updateVersion) {
      throw new Error(`Missing version for existing entry: ${contentType}/${slug}`);
    }

    await client.entry.update(
      { entryId, spaceId, environmentId },
      {
        ...existing,
        fields: { ...existing.fields, ...fields },
        sys: {
          ...existing.sys,
          version: updateVersion,
        },
      },
    );
    const refreshed = await client.entry.get({ entryId, spaceId, environmentId });
    const publishVersion = refreshed?.sys?.version;
    if (!publishVersion) {
      throw new Error(`Missing publish version for entry: ${contentType}/${slug}`);
    }
    await client.entry.publish(
      { entryId, spaceId, environmentId },
      {
        ...refreshed,
        sys: {
          ...refreshed.sys,
          version: publishVersion,
        },
      },
    );
    console.log(`Updated entry: ${contentType}/${slug}`);
    return refreshed;
  }

  await client.entry.createWithId(
    { entryId, contentTypeId: contentType, spaceId, environmentId },
    { fields },
  );
  const created = await client.entry.get({ entryId, spaceId, environmentId });
  const createVersion = created?.sys?.version;
  if (!createVersion) {
    throw new Error(`Missing publish version for new entry: ${contentType}/${slug}`);
  }
  await client.entry.publish(
    { entryId, spaceId, environmentId },
    {
      ...created,
      sys: {
        ...created.sys,
        version: createVersion,
      },
    },
  );
  console.log(`Created entry: ${contentType}/${slug}`);
  return created;
}

async function upsertSingleEntry(client, spaceId, environmentId, contentType, fields) {
  const existing = await client.entry
    .getMany({
      spaceId,
      environmentId,
      query: { content_type: contentType, limit: 1 },
    })
    .then((res) => res.items?.[0] || null)
    .catch(() => null);

  if (existing) {
    const updateVersion = existing?.sys?.version;
    if (!updateVersion) {
      throw new Error(`Missing version for existing singleton entry: ${contentType}`);
    }

    await client.entry.update(
      { entryId: existing.sys.id, spaceId, environmentId },
      {
        ...existing,
        fields: { ...existing.fields, ...fields },
        sys: {
          ...existing.sys,
          version: updateVersion,
        },
      },
    );
    const refreshed = await client.entry.get({ entryId: existing.sys.id, spaceId, environmentId });
    const publishVersion = refreshed?.sys?.version;
    if (!publishVersion) {
      throw new Error(`Missing publish version for singleton entry: ${contentType}`);
    }
    await client.entry.publish(
      { entryId: existing.sys.id, spaceId, environmentId },
      {
        ...refreshed,
        sys: {
          ...refreshed.sys,
          version: publishVersion,
        },
      },
    );
    console.log(`Updated singleton entry: ${contentType}`);
    return refreshed;
  }

  const created = await client.entry.create(
    { contentTypeId: contentType, spaceId, environmentId },
    { fields },
  );
  const createdVersion = created?.sys?.version;
  if (!createdVersion) {
    throw new Error(`Missing publish version for singleton create: ${contentType}`);
  }
  await client.entry.publish(
    { entryId: created.sys.id, spaceId, environmentId },
    {
      ...created,
      sys: {
        ...created.sys,
        version: createdVersion,
      },
    },
  );
  console.log(`Created singleton entry: ${contentType}`);
  return created;
}

async function run() {
  loadEnvFile();

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master';
  const managementToken =
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN ||
    process.env.CONTENTFUL_MANAGEMENT_TOKEN ||
    process.env.CONTENTFUL_MANAGEMENT_API_KEY;

  if (!spaceId || !managementToken) {
    throw new Error(
      'Missing required env vars. Need CONTENTFUL_SPACE_ID and one of CONTENTFUL_MANAGEMENT_ACCESS_TOKEN|CONTENTFUL_MANAGEMENT_TOKEN|CONTENTFUL_MANAGEMENT_API_KEY',
    );
  }

  const client = contentful.createClient(
    { accessToken: managementToken },
    { type: 'plain', defaults: { spaceId, environmentId } },
  );

  // 1) Sync content model
  await upsertContentType(client, 'event.schema.json', spaceId, environmentId);
  await upsertContentType(client, 'section-block.schema.json', spaceId, environmentId);
  await upsertContentType(client, 'landing-page.schema.json', spaceId, environmentId);
  await upsertContentType(client, 'site-settings.schema.json', spaceId, environmentId);

  // 2) Seed section blocks
  const heroBlock = await upsertEntryBySlug(client, spaceId, environmentId, 'sectionBlock', 'home-hero', {
    title: { 'en-US': 'Homepage Hero Block' },
    slug: { 'en-US': 'home-hero' },
    blockType: { 'en-US': 'hero' },
    headline: { 'en-US': 'Compete in Upcoming Chess Tournaments' },
    body: {
      'en-US': 'Find rated events, local opens, and club championships with regularly updated schedules.',
    },
  });

  const editorialBlock = await upsertEntryBySlug(client, spaceId, environmentId, 'sectionBlock', 'home-editorial', {
    title: { 'en-US': 'Homepage Editorial Block' },
    slug: { 'en-US': 'home-editorial' },
    blockType: { 'en-US': 'editorialText' },
    headline: { 'en-US': 'Built for editors, not deploys' },
    body: {
      'en-US': 'Change homepage sections, headlines, and event highlights directly in Contentful without code changes.',
    },
  });

  // 3) Seed sample event
  const eventEntry = await upsertEntryBySlug(client, spaceId, environmentId, 'event', 'sample-chess-tournament', {
    title: { 'en-US': 'Sample Chess Tournament' },
    slug: { 'en-US': 'sample-chess-tournament' },
    summary: { 'en-US': 'An example event seeded automatically for homepage and route testing.' },
    description: {
      'en-US': {
        nodeType: 'document',
        data: {},
        content: [
          {
            nodeType: 'paragraph',
            data: {},
            content: [
              {
                nodeType: 'text',
                value: 'This sample event was created by the zero-touch sync script.',
                marks: [],
                data: {},
              },
            ],
          },
        ],
      },
    },
    eventDate: { 'en-US': new Date().toISOString() },
    locationName: { 'en-US': 'Main Hall' },
    locationDetails: { 'en-US': '123 Chess Lane, City Center' },
    status: { 'en-US': 'published' },
    registrationUrl: { 'en-US': 'https://example.com/register' },
    format: { 'en-US': 'Swiss' },
  });

  // 4) Seed landing page and site settings
  await upsertEntryBySlug(client, spaceId, environmentId, 'landingPage', 'home', {
    title: { 'en-US': 'Main Homepage' },
    slug: { 'en-US': 'home' },
    heroHeadline: { 'en-US': 'Play, Improve, and Compete' },
    heroDescription: {
      'en-US': 'Your tournament hub, powered by Contentful. Editors can update this page without touching code.',
    },
    featuredEvents: {
      'en-US': [
        {
          sys: { type: 'Link', linkType: 'Entry', id: eventEntry.sys.id },
        },
      ],
    },
    sections: {
      'en-US': [
        {
          sys: { type: 'Link', linkType: 'Entry', id: heroBlock.sys.id },
        },
        {
          sys: { type: 'Link', linkType: 'Entry', id: editorialBlock.sys.id },
        },
      ],
    },
  });

  await upsertSingleEntry(client, spaceId, environmentId, 'siteSettings', {
    siteName: { 'en-US': 'Casey ChessnutZ' },
    defaultSeoTitle: { 'en-US': 'Casey ChessnutZ | Tournament Listings' },
    defaultSeoDescription: {
      'en-US': 'Discover upcoming chess events and keep your homepage fresh with Contentful-powered sections.',
    },
    footerText: { 'en-US': 'Content managed in Contentful.' },
    navigationConfig: {
      'en-US': { items: [
        { label: 'Tournaments', href: '/events', style: 'text', enabled: true },
        { label: 'About', href: '/#about', style: 'text', enabled: true },
        { label: 'Find an event', href: '/events', style: 'primary', enabled: true },
      ] },
    },
  });

  console.log('Zero-touch sync complete. Content model and homepage seed are live.');
}

run().catch((err) => {
  console.error(err?.stack || err?.message || err);
  process.exit(1);
});
