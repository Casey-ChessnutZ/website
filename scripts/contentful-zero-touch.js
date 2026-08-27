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
    disabled: Boolean(field.disabled),
    omitted: Boolean(field.omitted),
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

    const requestedIds = new Set(payload.fields.map((field) => field.id));
    const deprecatedFields = (existing.fields || []).filter((field) => !requestedIds.has(field.id) && !field.omitted);
    if (deprecatedFields.length) {
      await client.contentType.update(
        { contentTypeId, spaceId, environmentId },
        { ...existing, fields: existing.fields.map((field) => deprecatedFields.some((deprecated) => deprecated.id === field.id) ? { ...field, omitted: true } : field), sys: { version: updateVersion } },
      );
      const omitted = await client.contentType.get({ contentTypeId, spaceId, environmentId });
      await client.contentType.publish({ contentTypeId, spaceId, environmentId }, { ...omitted, sys: { ...omitted.sys, version: omitted.sys.version } });
    }
    const current = await client.contentType.get({ contentTypeId, spaceId, environmentId });
    await client.contentType.update(
      { contentTypeId, spaceId, environmentId },
      {
        ...payload,
        sys: {
          version: current.sys.version,
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

async function deleteContentTypeAndEntries(client, contentTypeId, spaceId, environmentId) {
  const entries = await client.entry.getMany({ spaceId, environmentId, query: { content_type: contentTypeId, limit: 1000 } }).catch(() => ({ items: [] }));
  for (const entry of entries.items || []) {
    const entryId = entry.sys.id;
    if (entry.sys.publishedVersion) {
      await client.entry.unpublish({ entryId, spaceId, environmentId }, { ...entry, sys: { ...entry.sys, version: entry.sys.version } });
    }
    const current = await client.entry.get({ entryId, spaceId, environmentId });
    await client.entry.delete({ entryId, spaceId, environmentId }, { ...current, sys: { ...current.sys, version: current.sys.version } });
  }
  const contentType = await client.contentType.get({ contentTypeId, spaceId, environmentId }).catch(() => null);
  if (!contentType) return;
  if (contentType.sys.publishedVersion) await client.contentType.unpublish({ contentTypeId, spaceId, environmentId }, { ...contentType, sys: { ...contentType.sys, version: contentType.sys.version } });
  const current = await client.contentType.get({ contentTypeId, spaceId, environmentId });
  await client.contentType.delete({ contentTypeId, spaceId, environmentId }, { ...current, sys: { ...current.sys, version: current.sys.version } });
  console.log(`Deleted legacy content type: ${contentTypeId}`);
}

async function configureSlugEditor(client, schemaFile, spaceId, environmentId) {
  const schemaPath = path.join(process.cwd(), 'content-model', 'schemas', schemaFile);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const slugField = (schema.fields || []).find((field) => field.id === 'slug');
  const trackingFieldId = schema.displayField;

  if (!slugField || !trackingFieldId) return;

  const contentTypeId = schema.sys.id;
  const editorInterface = await client.editorInterface.get({ contentTypeId, spaceId, environmentId });
  const controls = (editorInterface.controls || []).filter((control) => control.fieldId !== 'slug');
  const previousSlugControl = (editorInterface.controls || []).find((control) => control.fieldId === 'slug');
  controls.push({
    fieldId: 'slug',
    widgetNamespace: 'builtin',
    widgetId: 'slugEditor',
    settings: { ...(previousSlugControl?.settings || {}), trackingFieldId },
  });

  await client.editorInterface.update(
    { contentTypeId, spaceId, environmentId },
    {
      ...editorInterface,
      controls,
      sys: { version: editorInterface.sys.version },
    },
  );
  console.log(`Configured slug editor: ${contentTypeId} ← ${trackingFieldId}`);
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

  // 1) Sync content model. A seed-only retry avoids repeating model writes after API throttling.
  if (!process.env.CONTENTFUL_SKIP_MODEL_SYNC) {
  await upsertContentType(client, 'person.schema.json', spaceId, environmentId);
  await upsertContentType(client, 'event.schema.json', spaceId, environmentId);
  await upsertContentType(client, 'news.schema.json', spaceId, environmentId);
  await upsertContentType(client, 'page.schema.json', spaceId, environmentId);
  await upsertContentType(client, 'contact-form.schema.json', spaceId, environmentId);
  for (const schemaFile of ['home-hero.schema.json', 'rich-text-section.schema.json', 'image-text-section.schema.json', 'featured-events-section.schema.json', 'event-countdown-section.schema.json', 'feature-card.schema.json', 'feature-cards-section.schema.json', 'image-gallery-section.schema.json', 'timeline-item.schema.json', 'timeline-section.schema.json', 'quote-section.schema.json', 'cta-banner-section.schema.json']) {
    await upsertContentType(client, schemaFile, spaceId, environmentId);
  }
  await upsertContentType(client, 'landing-page.schema.json', spaceId, environmentId);
  await upsertContentType(client, 'site-settings.schema.json', spaceId, environmentId);
  await configureSlugEditor(client, 'person.schema.json', spaceId, environmentId);
  await configureSlugEditor(client, 'event.schema.json', spaceId, environmentId);
  await configureSlugEditor(client, 'news.schema.json', spaceId, environmentId);
  await configureSlugEditor(client, 'page.schema.json', spaceId, environmentId);
  await configureSlugEditor(client, 'landing-page.schema.json', spaceId, environmentId);
  }

  // Previous generic sectionBlock seed retained only as source-history while the clean migration runs.
  if (false) {
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

  }

  // 3) Seed people and event examples. Homepage-only retries reuse deterministic IDs.
  let melbourneOpen;
  let springRapid;
  let koshnitskyCup;
  if (process.env.CONTENTFUL_SKIP_CORE_SEED) {
    melbourneOpen = { sys: { id: 'event--melbourne-open-2026' } };
    springRapid = { sys: { id: 'event--spring-rapid-2026' } };
    koshnitskyCup = { sys: { id: 'event--2026-koshnitsky-cup' } };
  } else {
  const alexMorgan = await upsertEntryBySlug(client, spaceId, environmentId, 'person', 'alex-morgan', {
    name: { 'en-US': 'Alex Morgan' }, slug: { 'en-US': 'alex-morgan' }, title: { 'en-US': 'Tournament Organiser' }, federation: { 'en-US': 'Chess Victoria' }, location: { 'en-US': 'Melbourne, Australia' },
    about: { 'en-US': richText('Alex coordinates Chessnutz tournaments with a focus on clear player communication and a welcoming tournament experience.') },
  });
  const priyaShah = await upsertEntryBySlug(client, spaceId, environmentId, 'person', 'priya-shah', {
    name: { 'en-US': 'Priya Shah' }, slug: { 'en-US': 'priya-shah' }, title: { 'en-US': 'Chief Arbiter' }, federation: { 'en-US': 'FIDE' }, location: { 'en-US': 'Melbourne, Australia' }, fideProfileUrl: { 'en-US': 'https://ratings.fide.com/' },
    about: { 'en-US': richText('Priya is responsible for fair play, tournament rulings, and the smooth running of every round.') },
  });
  const danielWong = await upsertEntryBySlug(client, spaceId, environmentId, 'person', 'daniel-wong', {
    name: { 'en-US': 'Daniel Wong' }, slug: { 'en-US': 'daniel-wong' }, title: { 'en-US': 'Arbiter' }, federation: { 'en-US': 'Chess Victoria' }, location: { 'en-US': 'Melbourne, Australia' },
    about: { 'en-US': richText('Daniel supports player check-in, pairing operations, and on-the-floor tournament assistance.') },
  });

  const melbourneOpen2025 = await upsertEntryBySlug(client, spaceId, environmentId, 'event', 'melbourne-open-2025', {
    title: { 'en-US': 'Melbourne Open 2025' }, slug: { 'en-US': 'melbourne-open-2025' },
    summary: { 'en-US': 'The previous edition of our five-round Melbourne Open weekend.' },
    description: { 'en-US': richText('A competitive weekend of classical chess that set the stage for the next Melbourne Open.') },
    eventDate: { 'en-US': '2025-11-15T10:00:00.000Z' }, locationName: { 'en-US': 'The Wheeler Centre' },
    status: { 'en-US': 'archived' }, format: { 'en-US': 'Five-round Swiss' }, organizer: { 'en-US': 'Chessnutz' }, tags: { 'en-US': ['Classical', 'Open', 'Melbourne', 'Archive'] },
  });

  melbourneOpen = await upsertEntryBySlug(client, spaceId, environmentId, 'event', 'melbourne-open-2026', {
    title: { 'en-US': 'Melbourne Open 2026' }, slug: { 'en-US': 'melbourne-open-2026' },
    summary: { 'en-US': 'A five-round weekend tournament for ambitious club players and seasoned competitors.' },
    description: { 'en-US': richText('The Melbourne Open brings together players from across Victoria for a considered weekend of classical chess. Pairings are published before every round, with a quiet analysis area available throughout the event.') },
    eventDate: { 'en-US': '2026-11-14T10:00:00.000Z' }, locationName: { 'en-US': 'The Wheeler Centre' }, locationDetails: { 'en-US': '176 Little Lonsdale Street, Melbourne. Registration opens from 9:00am in the main foyer.' },
    status: { 'en-US': 'published' }, registrationUrl: { 'en-US': 'https://example.com/melbourne-open-2026' }, format: { 'en-US': 'Five-round Swiss' },
    schedule: { 'en-US': 'Saturday: rounds 1–3 at 10:00, 13:30 and 16:30. Sunday: rounds 4–5 at 10:00 and 14:00.' }, prizeInformation: { 'en-US': 'Prize details will be published with the final entry list.' },
    eligibility: { 'en-US': 'Open to all rated players. Junior players require a parent or guardian contact on registration.' }, organizer: { 'en-US': 'Chessnutz' }, tags: { 'en-US': ['Classical', 'Open', 'Melbourne'] },
    venueAddress: { 'en-US': '176 Little Lonsdale Street, Melbourne VIC 3000' }, venueLocation: { 'en-US': { lat: -37.8108, lon: 144.9655 } }, venueNotes: { 'en-US': 'Registration opens at the main foyer from 9:00am. The venue is a short walk from Melbourne Central station.' },
    scheduleTimeline: { 'en-US': { items: [{ time: 'Saturday · 9:00am', title: 'Registration', detail: 'Collect your player details at the main foyer.' }, { time: 'Saturday · 10:00am', title: 'Round 1', detail: 'Boards close five minutes before the round.' }, { time: 'Saturday · 1:30pm', title: 'Round 2' }, { time: 'Saturday · 4:30pm', title: 'Round 3' }, { time: 'Sunday · 10:00am', title: 'Round 4' }, { time: 'Sunday · 2:00pm', title: 'Round 5 & presentations', detail: 'Prize presentation follows the final round.' }] } },
    officials: { 'en-US': [{ sys: { type: 'Link', linkType: 'Entry', id: alexMorgan.sys.id } }, { sys: { type: 'Link', linkType: 'Entry', id: priyaShah.sys.id } }, { sys: { type: 'Link', linkType: 'Entry', id: danielWong.sys.id } }] },
    relatedEvents: { 'en-US': [{ sys: { type: 'Link', linkType: 'Entry', id: melbourneOpen2025.sys.id } }] },
  });

  springRapid = await upsertEntryBySlug(client, spaceId, environmentId, 'event', 'spring-rapid-2026', {
    title: { 'en-US': 'Spring Rapid 2026' }, slug: { 'en-US': 'spring-rapid-2026' }, summary: { 'en-US': 'Six rapid rounds, one bright Saturday, and a friendly competitive field.' },
    description: { 'en-US': richText('A welcoming rapid event for players looking for quality games in a single afternoon.') }, eventDate: { 'en-US': '2026-09-19T11:00:00.000Z' },
    locationName: { 'en-US': 'Fitzroy Town Hall' }, status: { 'en-US': 'published' }, format: { 'en-US': '15+10 Rapid Swiss' }, organizer: { 'en-US': 'Chessnutz' }, tags: { 'en-US': ['Rapid', 'Melbourne'] },
  });

  const summerBlitz = await upsertEntryBySlug(client, spaceId, environmentId, 'event', 'summer-blitz-2026', {
    title: { 'en-US': 'Summer Blitz 2026' }, slug: { 'en-US': 'summer-blitz-2026' }, summary: { 'en-US': 'An evening of quick decisions, sharp tactics, and relaxed summer chess.' },
    description: { 'en-US': richText('Bring your best practical chess for a social evening of blitz and post-game analysis.') }, eventDate: { 'en-US': '2026-12-12T18:00:00.000Z' },
    locationName: { 'en-US': 'Docklands Chess Club' }, status: { 'en-US': 'published' }, format: { 'en-US': '3+2 Blitz Swiss' }, organizer: { 'en-US': 'Chessnutz' }, tags: { 'en-US': ['Blitz', 'Evening'] },
  });

  // Major event example: realistic test data, not extracted from the protected pairing site.
  const koshnitskyPairingUrl = 'https://hbcc.free.nf/www2026KoshnitskyCupRookiesandJuniors/index.php';
  const koshnitskyMajor = await upsertEntryBySlug(client, spaceId, environmentId, 'event', '2026-koshnitsky-cup-major', {
    title: { 'en-US': '2026 Koshnitsky Cup — Major Division' }, slug: { 'en-US': '2026-koshnitsky-cup-major' },
    summary: { 'en-US': 'The leading division for experienced tournament players.' },
    description: { 'en-US': richText('A serious classical division with a focused competitive field. This entry is sample content for testing major-event divisions.') },
    eventDate: { 'en-US': '2026-10-03T00:00:00.000Z' }, locationName: { 'en-US': 'Hobsons Bay Chess Club' }, locationDetails: { 'en-US': 'Sample venue details for the Koshnitsky Cup test event.' },
    status: { 'en-US': 'published' }, registrationUrl: { 'en-US': 'https://example.com/koshnitsky-cup-2026' }, pairingUrl: { 'en-US': koshnitskyPairingUrl }, format: { 'en-US': 'Five-round Classical Swiss' },
    schedule: { 'en-US': 'Saturday: rounds 1–3. Sunday: rounds 4–5.' }, eligibility: { 'en-US': 'Open to experienced rated players.' }, organizer: { 'en-US': 'Chessnutz' }, tags: { 'en-US': ['Koshnitsky Cup', 'Major', 'Classical'] },
  });

  const koshnitskyMinor = await upsertEntryBySlug(client, spaceId, environmentId, 'event', '2026-koshnitsky-cup-minor', {
    title: { 'en-US': '2026 Koshnitsky Cup — Minor Division' }, slug: { 'en-US': '2026-koshnitsky-cup-minor' },
    summary: { 'en-US': 'A competitive division designed for developing club players.' },
    description: { 'en-US': richText('A welcoming division with plenty of tournament experience and clear progression opportunities. This entry is sample content for testing major-event divisions.') },
    eventDate: { 'en-US': '2026-10-03T00:00:00.000Z' }, locationName: { 'en-US': 'Hobsons Bay Chess Club' }, locationDetails: { 'en-US': 'Sample venue details for the Koshnitsky Cup test event.' },
    status: { 'en-US': 'published' }, registrationUrl: { 'en-US': 'https://example.com/koshnitsky-cup-2026' }, pairingUrl: { 'en-US': koshnitskyPairingUrl }, format: { 'en-US': 'Five-round Classical Swiss' },
    schedule: { 'en-US': 'Saturday: rounds 1–3. Sunday: rounds 4–5.' }, eligibility: { 'en-US': 'Open to developing club players.' }, organizer: { 'en-US': 'Chessnutz' }, tags: { 'en-US': ['Koshnitsky Cup', 'Minor', 'Classical'] },
  });

  const koshnitskyRookies = await upsertEntryBySlug(client, spaceId, environmentId, 'event', '2026-koshnitsky-cup-rookies', {
    title: { 'en-US': '2026 Koshnitsky Cup — Rookies Division' }, slug: { 'en-US': '2026-koshnitsky-cup-rookies' },
    summary: { 'en-US': 'A supported introduction to tournament chess for rookies and juniors.' },
    description: { 'en-US': richText('A friendly entry point for newer tournament players, with a clear structure and space to learn. This entry is sample content for testing major-event divisions.') },
    eventDate: { 'en-US': '2026-10-03T00:00:00.000Z' }, locationName: { 'en-US': 'Hobsons Bay Chess Club' }, locationDetails: { 'en-US': 'Sample venue details for the Koshnitsky Cup test event.' },
    status: { 'en-US': 'published' }, registrationUrl: { 'en-US': 'https://example.com/koshnitsky-cup-2026' }, pairingUrl: { 'en-US': koshnitskyPairingUrl }, format: { 'en-US': 'Five-round Junior Swiss' },
    schedule: { 'en-US': 'Saturday: rounds 1–3. Sunday: rounds 4–5.' }, eligibility: { 'en-US': 'Open to rookies and junior players.' }, organizer: { 'en-US': 'Chessnutz' }, tags: { 'en-US': ['Koshnitsky Cup', 'Rookies', 'Juniors'] },
  });

  koshnitskyCup = await upsertEntryBySlug(client, spaceId, environmentId, 'event', '2026-koshnitsky-cup', {
    title: { 'en-US': '2026 Koshnitsky Cup' }, slug: { 'en-US': '2026-koshnitsky-cup' },
    summary: { 'en-US': 'A major sample event with Major, Minor, and Rookies divisions.' },
    description: { 'en-US': richText('Choose the division that matches your experience, then open its event page for the full schedule, eligibility, registration, and pairings link.') },
    eventDate: { 'en-US': '2026-10-03T00:00:00.000Z' }, locationName: { 'en-US': 'Hobsons Bay Chess Club' }, locationDetails: { 'en-US': 'Sample venue details for the Koshnitsky Cup test event.' },
    status: { 'en-US': 'published' }, registrationUrl: { 'en-US': 'https://example.com/koshnitsky-cup-2026' }, pairingUrl: { 'en-US': koshnitskyPairingUrl }, format: { 'en-US': 'Multi-division tournament' },
    schedule: { 'en-US': 'Saturday and Sunday, with division-specific pairings published before every round.' }, eligibility: { 'en-US': 'See the individual division pages for eligibility.' }, organizer: { 'en-US': 'Chessnutz' }, tags: { 'en-US': ['Koshnitsky Cup', 'Major Event'] },
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
  const pages = [
    { slug: 'about-me', title: 'About Me', summary: 'Meet the organiser behind Chessnutz.', content: 'Chessnutz creates welcoming, well-run chess events and coaching opportunities for players across Melbourne.' },
    { slug: 'terms-and-conditions', title: 'Terms and Conditions', summary: 'The conditions that apply when you register for and attend our events.', content: 'These terms explain event registrations, conduct, refunds, and our responsibilities to players.' },
    { slug: 'privacy', title: 'Privacy', summary: 'How Chessnutz handles the information you share with us.', content: 'We use your contact details only to administer events, provide important updates, and improve the tournament experience.' },
    { slug: 'faq', title: 'Frequently Asked Questions', summary: 'Practical answers for players before tournament day.', content: 'Check the relevant event page for registration deadlines, venue details, pairing information, and eligibility.' },
    { slug: 'tournament-calendar', title: 'Tournament Calendar', summary: 'A central view of upcoming tournament dates.', content: 'The Excel spreadsheet link will be added here when the live schedule is ready.' },
    { slug: 'rates', title: 'Coaching Rates', summary: 'Clear coaching options for every stage of your chess journey.', content: 'Sample rates are available here for now. Update this page in Contentful with your confirmed coaching packages.' },
    { slug: 'coaches', title: 'Coaches', summary: 'Meet the people who help players improve.', content: 'Add coach biographies, playing experience, and availability here.' },
    { slug: 'tournament-register', title: 'Tournament Registration', summary: 'How to register for upcoming Chessnutz events.', content: 'Choose an event from the tournament calendar and follow its registration instructions.' },
    { slug: 'tournament-results', title: 'Tournament Results', summary: 'Results from recent Chessnutz tournaments.', content: 'Results will be published here after each event.' },
    { slug: 'dgt-links', title: 'DGT Links', summary: 'Live boards and tournament information.', content: 'Add official DGT live-board and pairing links here as each tournament approaches.' },
  ];
  for (const page of pages) {
    await upsertEntryBySlug(client, spaceId, environmentId, 'page', page.slug, { title: { 'en-US': page.title }, slug: { 'en-US': page.slug }, summary: { 'en-US': page.summary }, content: { 'en-US': richText(page.content) } });
  }
  await upsertSingleEntry(client, spaceId, environmentId, 'contactForm', {
    title: { 'en-US': 'Start a conversation.' },
    intro: { 'en-US': 'Ask about tournament entries, accessibility, partnerships, or coaching.' },
    successMessage: { 'en-US': 'Thanks — your message has been sent.' },
    fields: { 'en-US': [
      { id: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Your name' },
      { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
      { id: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'How can we help?' },
      { id: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Write your message' },
    ] },
  });
  }

  if (process.env.CONTENTFUL_FINALIZE_ONLY) {
    await deleteContentTypeAndEntries(client, 'sectionBlock', spaceId, environmentId);
    console.log('Legacy Contentful cleanup complete.');
    return;
  }

  // 4) Seed focused, editor-friendly homepage sections
  const homeHero = await upsertEntryBySlug(client, spaceId, environmentId, 'homeHero', 'home-hero', {
    title: { 'en-US': 'Find your next board' }, eyebrow: { 'en-US': 'Chessnutz' }, body: { 'en-US': 'A considered calendar of rated tournaments, club events, and good games across Melbourne.' }, primaryCtaLabel: { 'en-US': 'Explore tournaments' }, primaryCtaUrl: { 'en-US': '/events' }, secondaryCtaLabel: { 'en-US': 'Meet the team' }, secondaryCtaUrl: { 'en-US': '/team' },
  });
  const homeIntro = await upsertEntryBySlug(client, spaceId, environmentId, 'richTextSection', 'home-intro', {
    title: { 'en-US': 'A considered calendar' }, eyebrow: { 'en-US': 'Made for players' }, body: { 'en-US': richText('Whether you are returning to tournament chess or chasing your next title, every event has the details you need before you sit at the board.') },
  });
  const homeImageText = await upsertEntryBySlug(client, spaceId, environmentId, 'imageTextSection', 'home-community', {
    title: { 'en-US': 'Chess, with company' }, eyebrow: { 'en-US': 'The local game' }, body: { 'en-US': richText('Clear pairings, welcoming rooms, and time to analyse the game afterwards. We make tournament days feel considered from the first round to the last.') }, imageOnLeft: { 'en-US': true }, ctaLabel: { 'en-US': 'Our team' }, ctaUrl: { 'en-US': '/team' },
  });
  const homeEvents = await upsertEntryBySlug(client, spaceId, environmentId, 'featuredEventsSection', 'home-events', {
    title: { 'en-US': 'Upcoming tournaments' }, eyebrow: { 'en-US': 'On the board' }, body: { 'en-US': 'Choose a tournament and make your next move.' }, events: { 'en-US': [{ sys: { type: 'Link', linkType: 'Entry', id: koshnitskyCup.sys.id } }, { sys: { type: 'Link', linkType: 'Entry', id: melbourneOpen.sys.id } }, { sys: { type: 'Link', linkType: 'Entry', id: springRapid.sys.id } }] },
  });
  const homeCountdown = await upsertEntryBySlug(client, spaceId, environmentId, 'eventCountdownSection', 'home-countdown', {
    title: { 'en-US': 'Melbourne Open begins soon' }, eyebrow: { 'en-US': 'Next key date' }, body: { 'en-US': 'Five rounds across a full weekend of classical chess.' }, targetDate: { 'en-US': '2026-11-14T10:00:00.000Z' }, ctaLabel: { 'en-US': 'View the event' }, ctaUrl: { 'en-US': '/events/melbourne-open-2026' },
  });
  const classicalCard = await upsertEntryBySlug(client, spaceId, environmentId, 'featureCard', 'classical', { title: { 'en-US': 'Classical' }, body: { 'en-US': 'Long-form games for players who want to think deeply.' } });
  const rapidCard = await upsertEntryBySlug(client, spaceId, environmentId, 'featureCard', 'rapid', { title: { 'en-US': 'Rapid' }, body: { 'en-US': 'Competitive games with momentum and a clear rhythm.' } });
  const blitzCard = await upsertEntryBySlug(client, spaceId, environmentId, 'featureCard', 'blitz', { title: { 'en-US': 'Blitz' }, body: { 'en-US': 'Fast rounds, decisive moments, and plenty of energy.' } });
  const homeCards = await upsertEntryBySlug(client, spaceId, environmentId, 'featureCardsSection', 'home-formats', { title: { 'en-US': 'Choose your format' }, eyebrow: { 'en-US': 'Find your rhythm' }, cards: { 'en-US': [{ sys: { type: 'Link', linkType: 'Entry', id: classicalCard.sys.id } }, { sys: { type: 'Link', linkType: 'Entry', id: rapidCard.sys.id } }, { sys: { type: 'Link', linkType: 'Entry', id: blitzCard.sys.id } }] } });
  const homeGallery = await upsertEntryBySlug(client, spaceId, environmentId, 'imageGallerySection', 'home-gallery', { title: { 'en-US': 'At the board' }, eyebrow: { 'en-US': 'Tournament days' }, body: { 'en-US': 'Add your best tournament images here in Contentful.' }, images: { 'en-US': [] } });
  const september = await upsertEntryBySlug(client, spaceId, environmentId, 'timelineItem', 'september', { title: { 'en-US': 'Spring Rapid' }, date: { 'en-US': 'September' }, body: { 'en-US': 'A fast-paced warm-up for the new season.' } });
  const november = await upsertEntryBySlug(client, spaceId, environmentId, 'timelineItem', 'november', { title: { 'en-US': 'Melbourne Open' }, date: { 'en-US': 'November' }, body: { 'en-US': 'Five rounds across a full weekend of play.' } });
  const december = await upsertEntryBySlug(client, spaceId, environmentId, 'timelineItem', 'december', { title: { 'en-US': 'Summer Blitz' }, date: { 'en-US': 'December' }, body: { 'en-US': 'Finish the year with an evening of quick chess.' } });
  const homeTimeline = await upsertEntryBySlug(client, spaceId, environmentId, 'timelineSection', 'home-season', { title: { 'en-US': 'The season ahead' }, eyebrow: { 'en-US': 'Save the dates' }, items: { 'en-US': [{ sys: { type: 'Link', linkType: 'Entry', id: september.sys.id } }, { sys: { type: 'Link', linkType: 'Entry', id: november.sys.id } }, { sys: { type: 'Link', linkType: 'Entry', id: december.sys.id } }] } });
  const homeQuote = await upsertEntryBySlug(client, spaceId, environmentId, 'quoteSection', 'home-quote', { quote: { 'en-US': 'The best tournament is one you remember for the people as much as the position.' }, attribution: { 'en-US': 'Alex Morgan' }, role: { 'en-US': 'Tournament Organiser' } });
  const homeCta = await upsertEntryBySlug(client, spaceId, environmentId, 'ctaBannerSection', 'home-cta', { title: { 'en-US': 'Ready when you are' }, eyebrow: { 'en-US': 'Your next move' }, body: { 'en-US': 'Browse the calendar, find the right format, and take your seat.' }, ctaLabel: { 'en-US': 'See all tournaments' }, ctaUrl: { 'en-US': '/events' }, theme: { 'en-US': 'ink' } });

  // 5) Seed landing page and site settings
  await upsertEntryBySlug(client, spaceId, environmentId, 'landingPage', 'home', {
    title: { 'en-US': 'Main Homepage' },
    slug: { 'en-US': 'home' },
    sections: {
      'en-US': [
        ...[homeHero, homeIntro, homeImageText, homeEvents, homeCountdown, homeCards, homeGallery, homeTimeline, homeQuote, homeCta].map((entry) => ({ sys: { type: 'Link', linkType: 'Entry', id: entry.sys.id } })),
      ],
    },
  });

  await upsertSingleEntry(client, spaceId, environmentId, 'siteSettings', {
    siteName: { 'en-US': 'Chessnutz' },
    defaultSeoTitle: { 'en-US': 'Chessnutz | Tournament Listings' },
    defaultSeoDescription: {
      'en-US': 'Discover upcoming chess events and keep your homepage fresh with Contentful-powered sections.',
    },
    footerText: { 'en-US': 'Content managed in Contentful.' },
    navigationConfig: { 'en-US': { groups: [
      { label: 'About', enabled: true, items: [{ label: 'About Me', href: '/page/about-me', enabled: true }, { label: 'FAQ', href: '/page/faq', enabled: true }] },
      { label: 'Photos', enabled: true, items: [{ label: 'Album', href: '/#album', enabled: true }] },
      { label: 'Tournament Calendar', enabled: true, items: [{ label: 'Excel Spreadsheet', href: '/page/tournament-calendar', enabled: true }] },
      { label: 'Coaching', enabled: true, items: [{ label: 'Rates', href: '/page/rates', enabled: true }, { label: 'Coaches', href: '/page/coaches', enabled: true }] },
      { label: 'Tournaments', enabled: true, items: [{ label: 'Register', href: '/page/tournament-register', enabled: true }, { label: 'Tournament Results', href: '/page/tournament-results', enabled: true }, { label: 'DGT Links', href: '/page/dgt-links', enabled: true }] },
      { label: 'Contact Us', enabled: true, items: [{ label: 'Form', href: '/contact', enabled: true }, { label: 'Newsletter', href: '/news', enabled: true }] },
    ] } },
  });

  await deleteContentTypeAndEntries(client, 'sectionBlock', spaceId, environmentId);

  console.log('Zero-touch sync complete. Content model and homepage seed are live.');
}

run().catch((err) => {
  console.error(err?.stack || err?.message || err);
  process.exit(1);
});
