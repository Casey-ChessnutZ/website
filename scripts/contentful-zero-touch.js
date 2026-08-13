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

function richText(value) {
  return {
    nodeType: 'document',
    data: {},
    content: [{ nodeType: 'paragraph', data: {}, content: [{ nodeType: 'text', value, marks: [], data: {} }] }],
  };
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
  await upsertContentType(client, 'news.schema.json', spaceId, environmentId);
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

  const countdownBlock = await upsertEntryBySlug(client, spaceId, environmentId, 'sectionBlock', 'home-countdown', {
    title: { 'en-US': 'Homepage Countdown' }, slug: { 'en-US': 'home-countdown' }, blockType: { 'en-US': 'countdown' },
    headline: { 'en-US': 'Melbourne Open begins soon' }, content: { 'en-US': { targetDate: '2026-11-14T10:00:00.000Z' } },
  });

  const formatsBlock = await upsertEntryBySlug(client, spaceId, environmentId, 'sectionBlock', 'home-formats', {
    title: { 'en-US': 'Tournament Formats' }, slug: { 'en-US': 'home-formats' }, blockType: { 'en-US': 'cardBlock' }, headline: { 'en-US': 'Choose your format' },
    content: { 'en-US': { cards: [
      { title: 'Classical', body: 'Long-form games for players who want to think deeply.' },
      { title: 'Rapid', body: 'Competitive games with momentum and a clear rhythm.' },
      { title: 'Blitz', body: 'Fast rounds, decisive moments, and plenty of energy.' },
    ] } },
  });

  const seasonBlock = await upsertEntryBySlug(client, spaceId, environmentId, 'sectionBlock', 'home-season', {
    title: { 'en-US': 'Season Timeline' }, slug: { 'en-US': 'home-season' }, blockType: { 'en-US': 'timeline' }, headline: { 'en-US': 'The season ahead' },
    content: { 'en-US': { items: [
      { date: 'September', title: 'Spring Rapid', description: 'A fast-paced warm-up for the new season.' },
      { date: 'November', title: 'Melbourne Open', description: 'Five rounds across a full weekend of play.' },
      { date: 'December', title: 'Summer Blitz', description: 'Finish the year with an evening of quick chess.' },
    ] } },
  });

  const registerBlock = await upsertEntryBySlug(client, spaceId, environmentId, 'sectionBlock', 'home-register', {
    title: { 'en-US': 'Homepage Registration CTA' }, slug: { 'en-US': 'home-register' }, blockType: { 'en-US': 'cta' },
    headline: { 'en-US': 'Your next game starts here' }, body: { 'en-US': 'Browse the calendar, choose an event, and register before entries close.' },
    ctaText: { 'en-US': 'Find an event' }, ctaUrl: { 'en-US': '/events' },
  });

  // 3) Seed event examples
  const melbourneOpen = await upsertEntryBySlug(client, spaceId, environmentId, 'event', 'melbourne-open-2026', {
    title: { 'en-US': 'Melbourne Open 2026' }, slug: { 'en-US': 'melbourne-open-2026' },
    summary: { 'en-US': 'A five-round weekend tournament for ambitious club players and seasoned competitors.' },
    description: { 'en-US': richText('The Melbourne Open brings together players from across Victoria for a considered weekend of classical chess. Pairings are published before every round, with a quiet analysis area available throughout the event.') },
    eventDate: { 'en-US': '2026-11-14T10:00:00.000Z' }, locationName: { 'en-US': 'The Wheeler Centre' }, locationDetails: { 'en-US': '176 Little Lonsdale Street, Melbourne. Registration opens from 9:00am in the main foyer.' },
    status: { 'en-US': 'published' }, registrationUrl: { 'en-US': 'https://example.com/melbourne-open-2026' }, format: { 'en-US': 'Five-round Swiss' },
    schedule: { 'en-US': 'Saturday: rounds 1–3 at 10:00, 13:30 and 16:30. Sunday: rounds 4–5 at 10:00 and 14:00.' }, prizeInformation: { 'en-US': 'Prize details will be published with the final entry list.' },
    eligibility: { 'en-US': 'Open to all rated players. Junior players require a parent or guardian contact on registration.' }, organizer: { 'en-US': 'Casey ChessnutZ' }, tags: { 'en-US': ['Classical', 'Open', 'Melbourne'] },
  });

  const springRapid = await upsertEntryBySlug(client, spaceId, environmentId, 'event', 'spring-rapid-2026', {
    title: { 'en-US': 'Spring Rapid 2026' }, slug: { 'en-US': 'spring-rapid-2026' }, summary: { 'en-US': 'Six rapid rounds, one bright Saturday, and a friendly competitive field.' },
    description: { 'en-US': richText('A welcoming rapid event for players looking for quality games in a single afternoon.') }, eventDate: { 'en-US': '2026-09-19T11:00:00.000Z' },
    locationName: { 'en-US': 'Fitzroy Town Hall' }, status: { 'en-US': 'published' }, format: { 'en-US': '15+10 Rapid Swiss' }, organizer: { 'en-US': 'Casey ChessnutZ' }, tags: { 'en-US': ['Rapid', 'Melbourne'] },
  });

  const summerBlitz = await upsertEntryBySlug(client, spaceId, environmentId, 'event', 'summer-blitz-2026', {
    title: { 'en-US': 'Summer Blitz 2026' }, slug: { 'en-US': 'summer-blitz-2026' }, summary: { 'en-US': 'An evening of quick decisions, sharp tactics, and relaxed summer chess.' },
    description: { 'en-US': richText('Bring your best practical chess for a social evening of blitz and post-game analysis.') }, eventDate: { 'en-US': '2026-12-12T18:00:00.000Z' },
    locationName: { 'en-US': 'Docklands Chess Club' }, status: { 'en-US': 'published' }, format: { 'en-US': '3+2 Blitz Swiss' }, organizer: { 'en-US': 'Casey ChessnutZ' }, tags: { 'en-US': ['Blitz', 'Evening'] },
  });

  // Major event example: realistic test data, not extracted from the protected pairing site.
  const koshnitskyPairingUrl = 'https://hbcc.free.nf/www2026KoshnitskyCupRookiesandJuniors/index.php';
  const koshnitskyMajor = await upsertEntryBySlug(client, spaceId, environmentId, 'event', '2026-koshnitsky-cup-major', {
    title: { 'en-US': '2026 Koshnitsky Cup — Major Division' }, slug: { 'en-US': '2026-koshnitsky-cup-major' },
    summary: { 'en-US': 'The leading division for experienced tournament players.' },
    description: { 'en-US': richText('A serious classical division with a focused competitive field. This entry is sample content for testing major-event divisions.') },
    eventDate: { 'en-US': '2026-10-03T00:00:00.000Z' }, locationName: { 'en-US': 'Hobsons Bay Chess Club' }, locationDetails: { 'en-US': 'Sample venue details for the Koshnitsky Cup test event.' },
    status: { 'en-US': 'published' }, registrationUrl: { 'en-US': 'https://example.com/koshnitsky-cup-2026' }, pairingUrl: { 'en-US': koshnitskyPairingUrl }, format: { 'en-US': 'Five-round Classical Swiss' },
    schedule: { 'en-US': 'Saturday: rounds 1–3. Sunday: rounds 4–5.' }, eligibility: { 'en-US': 'Open to experienced rated players.' }, organizer: { 'en-US': 'Casey ChessnutZ' }, tags: { 'en-US': ['Koshnitsky Cup', 'Major', 'Classical'] },
  });

  const koshnitskyMinor = await upsertEntryBySlug(client, spaceId, environmentId, 'event', '2026-koshnitsky-cup-minor', {
    title: { 'en-US': '2026 Koshnitsky Cup — Minor Division' }, slug: { 'en-US': '2026-koshnitsky-cup-minor' },
    summary: { 'en-US': 'A competitive division designed for developing club players.' },
    description: { 'en-US': richText('A welcoming division with plenty of tournament experience and clear progression opportunities. This entry is sample content for testing major-event divisions.') },
    eventDate: { 'en-US': '2026-10-03T00:00:00.000Z' }, locationName: { 'en-US': 'Hobsons Bay Chess Club' }, locationDetails: { 'en-US': 'Sample venue details for the Koshnitsky Cup test event.' },
    status: { 'en-US': 'published' }, registrationUrl: { 'en-US': 'https://example.com/koshnitsky-cup-2026' }, pairingUrl: { 'en-US': koshnitskyPairingUrl }, format: { 'en-US': 'Five-round Classical Swiss' },
    schedule: { 'en-US': 'Saturday: rounds 1–3. Sunday: rounds 4–5.' }, eligibility: { 'en-US': 'Open to developing club players.' }, organizer: { 'en-US': 'Casey ChessnutZ' }, tags: { 'en-US': ['Koshnitsky Cup', 'Minor', 'Classical'] },
  });

  const koshnitskyRookies = await upsertEntryBySlug(client, spaceId, environmentId, 'event', '2026-koshnitsky-cup-rookies', {
    title: { 'en-US': '2026 Koshnitsky Cup — Rookies Division' }, slug: { 'en-US': '2026-koshnitsky-cup-rookies' },
    summary: { 'en-US': 'A supported introduction to tournament chess for rookies and juniors.' },
    description: { 'en-US': richText('A friendly entry point for newer tournament players, with a clear structure and space to learn. This entry is sample content for testing major-event divisions.') },
    eventDate: { 'en-US': '2026-10-03T00:00:00.000Z' }, locationName: { 'en-US': 'Hobsons Bay Chess Club' }, locationDetails: { 'en-US': 'Sample venue details for the Koshnitsky Cup test event.' },
    status: { 'en-US': 'published' }, registrationUrl: { 'en-US': 'https://example.com/koshnitsky-cup-2026' }, pairingUrl: { 'en-US': koshnitskyPairingUrl }, format: { 'en-US': 'Five-round Junior Swiss' },
    schedule: { 'en-US': 'Saturday: rounds 1–3. Sunday: rounds 4–5.' }, eligibility: { 'en-US': 'Open to rookies and junior players.' }, organizer: { 'en-US': 'Casey ChessnutZ' }, tags: { 'en-US': ['Koshnitsky Cup', 'Rookies', 'Juniors'] },
  });

  const koshnitskyCup = await upsertEntryBySlug(client, spaceId, environmentId, 'event', '2026-koshnitsky-cup', {
    title: { 'en-US': '2026 Koshnitsky Cup' }, slug: { 'en-US': '2026-koshnitsky-cup' },
    summary: { 'en-US': 'A major sample event with Major, Minor, and Rookies divisions.' },
    description: { 'en-US': richText('Choose the division that matches your experience, then open its event page for the full schedule, eligibility, registration, and pairings link.') },
    eventDate: { 'en-US': '2026-10-03T00:00:00.000Z' }, locationName: { 'en-US': 'Hobsons Bay Chess Club' }, locationDetails: { 'en-US': 'Sample venue details for the Koshnitsky Cup test event.' },
    status: { 'en-US': 'published' }, registrationUrl: { 'en-US': 'https://example.com/koshnitsky-cup-2026' }, pairingUrl: { 'en-US': koshnitskyPairingUrl }, format: { 'en-US': 'Multi-division tournament' },
    schedule: { 'en-US': 'Saturday and Sunday, with division-specific pairings published before every round.' }, eligibility: { 'en-US': 'See the individual division pages for eligibility.' }, organizer: { 'en-US': 'Casey ChessnutZ' }, tags: { 'en-US': ['Koshnitsky Cup', 'Major Event'] },
    divisions: { 'en-US': [
      { sys: { type: 'Link', linkType: 'Entry', id: koshnitskyMajor.sys.id } },
      { sys: { type: 'Link', linkType: 'Entry', id: koshnitskyMinor.sys.id } },
      { sys: { type: 'Link', linkType: 'Entry', id: koshnitskyRookies.sys.id } },
    ] },
  });

  const newsEntries = [
    {
      slug: 'koshnitsky-cup-divisions-open',
      title: 'Koshnitsky Cup divisions are open',
      summary: 'Major, Minor, and Rookies divisions are now available to browse and register for.',
      publishedDate: '2026-08-20T00:00:00.000Z',
      tags: ['Announcements', 'Koshnitsky Cup'],
      content: 'Choose the division that best suits your experience, then review the schedule and eligibility on its event page. Pairing links will appear as the tournament approaches.',
    },
    {
      slug: 'melbourne-open-registration-note',
      title: 'Melbourne Open registration note',
      summary: 'Registration opens from 9:00am at the main foyer on the first morning of play.',
      publishedDate: '2026-09-04T00:00:00.000Z',
      tags: ['Melbourne Open', 'Player information'],
      content: 'Please arrive early enough to collect your details before pairings are finalised. The organiser desk can help with entry questions and venue access on the day.',
    },
    {
      slug: 'summer-blitz-season-finale',
      title: 'Summer Blitz closes the season',
      summary: 'Finish the year with an evening of quick chess, practical tactics, and post-game analysis.',
      publishedDate: '2026-10-12T00:00:00.000Z',
      tags: ['Summer Blitz', 'Season update'],
      content: 'The final event of the season is designed to be competitive and social in equal measure. Watch the event page for the confirmed round timetable and entry information.',
    },
  ];

  for (const news of newsEntries) {
    await upsertEntryBySlug(client, spaceId, environmentId, 'news', news.slug, {
      title: { 'en-US': news.title },
      slug: { 'en-US': news.slug },
      summary: { 'en-US': news.summary },
      publishedDate: { 'en-US': news.publishedDate },
      tags: { 'en-US': news.tags },
      content: { 'en-US': richText(news.content) },
    });
  }

  // 4) Seed landing page and site settings
  await upsertEntryBySlug(client, spaceId, environmentId, 'landingPage', 'home', {
    title: { 'en-US': 'Main Homepage' },
    slug: { 'en-US': 'home' },
    heroHeadline: { 'en-US': 'Play, Improve, and Compete' },
    heroDescription: {
      'en-US': 'Your tournament hub, powered by Contentful. Editors can update this page without touching code.',
    },
    featuredEvents: { 'en-US': [
      { sys: { type: 'Link', linkType: 'Entry', id: koshnitskyCup.sys.id } },
      { sys: { type: 'Link', linkType: 'Entry', id: melbourneOpen.sys.id } },
      { sys: { type: 'Link', linkType: 'Entry', id: springRapid.sys.id } },
      { sys: { type: 'Link', linkType: 'Entry', id: summerBlitz.sys.id } },
    ] },
    sections: {
      'en-US': [
        {
          sys: { type: 'Link', linkType: 'Entry', id: editorialBlock.sys.id },
        },
        { sys: { type: 'Link', linkType: 'Entry', id: countdownBlock.sys.id } },
        { sys: { type: 'Link', linkType: 'Entry', id: formatsBlock.sys.id } },
        { sys: { type: 'Link', linkType: 'Entry', id: seasonBlock.sys.id } },
        { sys: { type: 'Link', linkType: 'Entry', id: registerBlock.sys.id } },
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
        { label: 'News', href: '/news', style: 'text', enabled: true },
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
