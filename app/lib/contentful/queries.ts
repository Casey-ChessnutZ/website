import { contentfulFetch } from './client';
import { contentfulTags } from './cache-revalidation';
import { normalizeLocation, normalizeScheduleItems, resolveEventDivisions, resolveLinkedAsset, resolveRelatedEvents, richTextToPlainText, toRichTextDocument } from './mapping';
import type { Document } from '@contentful/rich-text-types';
import type {
  ContentfulAsset,
  ContentfulEntry,
  ContentfulReference,
  EventEntry,
  LandingPageBlock,
  LandingPageBlockType,
  LandingPageEntry,
  SiteSettingsEntry,
  NewsEntry,
  PersonEntry,
  PageEntry,
  ContactFormDefinition,
  PhotoAlbumEntry,
} from './types';
import { mapContactFormItem } from '@/app/lib/contact/contact-form-definition';
import { mapPhotoAlbumItem } from './photo-album';

type ContentfulCollection<T> = {
  items: T[];
  includes?: {
    Entry?: ContentfulEntry<Record<string, unknown>>[];
    Asset?: ContentfulAsset[];
  };
};

type ContentfulLandingPageItem = {
  sys: { id: string };
  fields: {
    title?: string;
    slug?: string;
    sections?: ContentfulReference[];
  };
};

type ContentfulEventItem = {
  sys: { id: string };
  fields: {
    title?: string;
    slug?: string;
    summary?: string;
    description?: unknown;
    eventDate?: string;
    locationName?: string;
    locationDetails?: string;
    venueAddress?: string;
    venueLocation?: unknown;
    venueNotes?: string;
    status?: 'draft' | 'scheduled' | 'published' | 'archived';
    heroMedia?: ContentfulReference | ContentfulAsset;
    registrationUrl?: string;
    pairingUrl?: string;
    documents?: ContentfulReference[];
    divisions?: ContentfulReference[];
    relatedEvents?: ContentfulReference[];
    format?: string;
    schedule?: string;
    scheduleItems?: unknown;
    scheduleTimeline?: unknown;
    prizeInformation?: string;
    eligibility?: string;
    organizer?: string;
    officials?: ContentfulReference[];
    tags?: string[];
  };
};

type ContentfulPersonItem = {
  sys: { id: string };
  fields: {
    name?: string;
    slug?: string;
    title?: string;
    fideProfileUrl?: string;
    about?: unknown;
    image?: ContentfulReference | ContentfulAsset;
    federation?: string;
    location?: string;
  };
};

type ContentfulNewsItem = {
  sys: { id: string };
  fields: {
    title?: string;
    slug?: string;
    summary?: string;
    publishedDate?: string;
    tags?: string[];
    content?: unknown;
  };
};

type ContentfulPageItem = {
  sys: { id: string };
  fields: { title?: string; slug?: string; summary?: string; content?: unknown; seoTitle?: string; seoDescription?: string };
};

type ContentfulContactFormItem = {
  sys: { id: string };
  fields: Record<string, unknown>;
};

type ContentfulPhotoAlbumItem = {
  sys: { id: string };
  fields: {
    title?: string;
    slug?: string;
    date?: string;
    description?: string;
    images?: ContentfulReference[];
  };
};

type ContentfulSiteSettingsItem = {
  sys: { id: string };
  fields: {
    siteName?: string;
    logo?: ContentfulReference | ContentfulAsset;
    defaultSeoTitle?: string;
    defaultSeoDescription?: string;
    footerText?: string;
    socialLinks?: Array<{
      label?: string;
      url?: string;
      fields?: {
        label?: string;
        url?: string;
      };
    }>;
    navigationConfig?: {
      items?: Array<{
        label?: string;
        href?: string;
        style?: 'primary' | 'text';
        enabled?: boolean;
      }>;
      groups?: Array<{
        label?: string;
        href?: string;
        enabled?: boolean;
        items?: Array<{
          label?: string;
          href?: string;
          style?: 'primary' | 'text';
          enabled?: boolean;
        }>;
      }>;
    };
    footerNavigationConfig?: {
      items?: Array<{
        label?: string;
        href?: string;
        style?: 'primary' | 'text';
        enabled?: boolean;
      }>;
      groups?: Array<{
        label?: string;
        href?: string;
        enabled?: boolean;
        items?: Array<{
          label?: string;
          href?: string;
          style?: 'primary' | 'text';
          enabled?: boolean;
        }>;
      }>;
    };
  };
};

function normalizeAsset(asset?: ContentfulReference | ContentfulAsset | null): ContentfulAsset | undefined {
  if (!asset) {
    return undefined;
  }

  if ('fields' in asset && asset.fields) {
    const fileUrl = asset.fields.file?.url ?? asset.url ?? undefined;

    return {
      sys: asset.sys,
      url: fileUrl ? (fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl) : undefined,
      title: asset.fields.title ?? asset.title,
      description: asset.fields.description ?? asset.description,
      fields: asset.fields,
    };
  }

  if ('url' in asset) {
    const assetUrl = asset.url ? (asset.url.startsWith('//') ? `https:${asset.url}` : asset.url) : undefined;

    return {
      sys: asset.sys,
      url: assetUrl,
      title: asset.title,
      description: asset.description,
      fields: asset.fields,
    };
  }

  return undefined;
}

function resolveLinkedEntries<T>(
  refs: ContentfulReference[] | undefined,
  entries: ContentfulEntry<Record<string, unknown>>[] = [],
): T[] {
  if (!refs?.length) {
    return [];
  }

  const lookup = new Map(entries.map((entry) => [entry.sys.id, entry]));

  return refs
    .map((ref) => lookup.get(ref.sys.id))
    .filter((entry): entry is ContentfulEntry<Record<string, unknown>> => Boolean(entry))
    .map((entry) => entry as T);
}

function resolveLinkedAssets(
  references: ContentfulReference[] | undefined,
  assets: ContentfulAsset[] = [],
): ContentfulAsset[] {
  const lookup = new Map(assets.map((asset) => [asset.sys?.id, asset]));
  return (references ?? []).flatMap((reference) => {
    const asset = lookup.get(reference.sys.id);
    const normalized = normalizeAsset(asset);
    return normalized ? [normalized] : [];
  });
}

export function mapLandingPageItem(item: ContentfulLandingPageItem, includes: ContentfulCollection<ContentfulLandingPageItem>['includes']): LandingPageEntry {
  const entryMap = includes?.Entry ?? [];

  const sections = (item.fields.sections ?? [])
    .map((reference) => {
      const match = entryMap.find((entry) => entry.sys.id === reference.sys.id);

      if (!match) {
        return null;
      }

      const contentType = match.sys.contentType?.sys?.id;
      if (!contentType || !['homeHero', 'richTextSection', 'imageTextSection', 'featuredEventsSection', 'eventCountdownSection', 'featureCardsSection', 'imageGallerySection', 'mediaEmbeded', 'timelineSection', 'quoteSection', 'ctaBannerSection'].includes(contentType)) return null;
      const raw = match.fields ?? {};
      const fields = {
        ...raw,
        headline: typeof raw.title === 'string' ? raw.title : undefined,
        body: typeof raw.body === 'string' ? raw.body : richTextToPlainText(raw.body),
        media: resolveLinkedAsset(raw.image as ContentfulReference | undefined, includes?.Asset) ?? normalizeAsset(raw.image as ContentfulReference | ContentfulAsset | undefined),
        images: resolveLinkedAssets(raw.images as ContentfulReference[] | undefined, includes?.Asset),
        featuredEvents: resolveLinkedEntries<EventEntry>(raw.events as ContentfulReference[] | undefined, entryMap),
        cards: resolveLinkedEntries<{ fields: Record<string, unknown> }>(raw.cards as ContentfulReference[] | undefined, entryMap).map((card) => ({ title: card.fields.title, body: card.fields.body })),
        items: resolveLinkedEntries<{ fields: Record<string, unknown> }>(raw.items as ContentfulReference[] | undefined, entryMap).map((timelineItem) => ({ title: timelineItem.fields.title, description: timelineItem.fields.body, date: timelineItem.fields.date })),
        ctaText: raw.ctaLabel ?? raw.primaryCtaLabel,
        ctaUrl: raw.ctaUrl ?? raw.primaryCtaUrl,
        url: typeof raw.url === 'string' ? raw.url : undefined,
        width: typeof raw.width === 'number' ? raw.width : undefined,
        height: typeof raw.height === 'number' ? raw.height : undefined,
      };
      return {
        sys: { id: match.sys.id },
        type: contentType as LandingPageBlockType,
        fields: fields as Record<string, unknown>,
      } satisfies LandingPageBlock;
    })
    .filter((section): section is LandingPageBlock => section !== null);

  return {
    sys: item.sys,
    title: item.fields.title ?? 'Landing Page',
    slug: item.fields.slug ?? 'home',
    sections: sections.length ? sections : undefined,
  };
}

export function mapEventItem(
  item: ContentfulEventItem,
  includes?: ContentfulCollection<ContentfulEventItem>['includes'],
): EventEntry {
  const heroMedia = normalizeAsset(item.fields.heroMedia);
  const officialEntries = resolveLinkedEntries<ContentfulEntry<ContentfulPersonItem['fields']>>(item.fields.officials, includes?.Entry);

  return {
    sys: item.sys,
    title: item.fields.title ?? 'Event',
    slug: item.fields.slug ?? '',
    summary: item.fields.summary,
    description: richTextToPlainText(item.fields.description),
    eventDate: item.fields.eventDate,
    locationName: item.fields.locationName,
    locationDetails: item.fields.locationDetails,
    venueAddress: item.fields.venueAddress,
    venueLocation: normalizeLocation(item.fields.venueLocation),
    venueNotes: item.fields.venueNotes,
    status: item.fields.status,
    heroMedia,
    registrationUrl: item.fields.registrationUrl,
    pairingUrl: item.fields.pairingUrl,
    documents: resolveLinkedAssets(item.fields.documents, includes?.Asset),
    divisions: resolveEventDivisions(item.fields.divisions, includes?.Entry).map((division) => ({
      ...division,
      status: division.status as EventEntry['status'] | undefined,
    })),
    relatedEvents: resolveRelatedEvents(item.fields.relatedEvents, includes?.Entry).map((relatedEvent) => ({
      ...relatedEvent,
      status: relatedEvent.status as EventEntry['status'] | undefined,
    })),
    format: item.fields.format,
    schedule: item.fields.schedule,
    scheduleItems: normalizeScheduleItems(item.fields.scheduleTimeline ?? item.fields.scheduleItems),
    prizeInformation: item.fields.prizeInformation,
    eligibility: item.fields.eligibility,
    organizer: item.fields.organizer,
    officials: officialEntries.map((official) => mapPersonItem({ sys: official.sys, fields: official.fields }, includes)),
    tags: item.fields.tags,
  };
}

function mapNewsItem(item: ContentfulNewsItem): NewsEntry {
  return {
    sys: item.sys,
    title: item.fields.title ?? 'News update',
    slug: item.fields.slug ?? '',
    summary: item.fields.summary,
    publishedDate: item.fields.publishedDate,
    tags: item.fields.tags,
    content: toRichTextDocument(item.fields.content) as Document | undefined,
  };
}

function mapPageItem(item: ContentfulPageItem): PageEntry {
  return { sys: item.sys, title: item.fields.title ?? 'Page', slug: item.fields.slug ?? '', summary: item.fields.summary, content: toRichTextDocument(item.fields.content) as Document | undefined, seoTitle: item.fields.seoTitle, seoDescription: item.fields.seoDescription };
}

function mapPersonItem(
  item: ContentfulPersonItem,
  includes?: ContentfulCollection<ContentfulPersonItem>['includes'],
): PersonEntry {
  const imageReference = item.fields.image;
  const imageId = imageReference?.sys?.id;
  const includedImage = imageId
    ? includes?.Asset?.find((asset) => asset.sys?.id === imageId)
    : undefined;

  return {
    sys: item.sys,
    name: item.fields.name ?? 'Tournament official',
    slug: item.fields.slug ?? '',
    title: item.fields.title,
    fideProfileUrl: item.fields.fideProfileUrl,
    about: richTextToPlainText(item.fields.about),
    image: normalizeAsset(includedImage ?? imageReference),
    federation: item.fields.federation,
    location: item.fields.location,
  };
}

function mapSiteSettingsItem(item: ContentfulSiteSettingsItem): SiteSettingsEntry {
  const socialLinks = (item.fields.socialLinks ?? [])
    .map((link) => ({
      label: link.label ?? link.fields?.label,
      url: link.url ?? link.fields?.url,
    }))
    .filter((link) => Boolean(link.label || link.url));

  return {
    sys: item.sys,
    siteName: item.fields.siteName ?? 'ChessNutZ',
    logo: normalizeAsset(item.fields.logo),
    defaultSeoTitle: item.fields.defaultSeoTitle ?? item.fields.siteName ?? 'ChessNutZ',
    defaultSeoDescription:
      item.fields.defaultSeoDescription ??
      'Discover upcoming chess tournaments and event details from the content-driven tournament site.',
    footerText: item.fields.footerText,
    socialLinks,
    navigationConfig: item.fields.navigationConfig,
    footerNavigationConfig: item.fields.footerNavigationConfig,
  };
}

export async function getPublishedLandingPage(preview = false): Promise<LandingPageEntry | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulLandingPageItem>>('entries', {
    content_type: 'landingPage',
    'fields.slug': 'home',
    order: '-sys.updatedAt',
    include: '10',
    limit: '1',
  }, [...contentfulTags('landingPage'), ...contentfulTags('homeHero'), ...contentfulTags('richTextSection'), ...contentfulTags('imageTextSection'), ...contentfulTags('featuredEventsSection'), ...contentfulTags('eventCountdownSection'), ...contentfulTags('featureCardsSection'), ...contentfulTags('imageGallerySection'), ...contentfulTags('timelineSection'), ...contentfulTags('quoteSection'), ...contentfulTags('ctaBannerSection'), ...contentfulTags('featureCard'), ...contentfulTags('timelineItem'), ...contentfulTags('event')], { preview });

  const item = response?.items?.[0];

  if (!item) {
    return null;
  }

  return mapLandingPageItem(item, response?.includes);
}

export async function getPublishedLandingPageBySlug(slug: string, preview = false): Promise<LandingPageEntry | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulLandingPageItem>>('entries', {
    content_type: 'landingPage', 'fields.slug': slug, order: '-sys.updatedAt', include: '10', limit: '1',
  }, [...contentfulTags('landingPage', slug), ...contentfulTags('mediaEmbeded')], { preview });
  return response?.items?.[0] ? mapLandingPageItem(response.items[0], response.includes) : null;
}

export async function getPublishedEventBySlug(slug: string, preview = false): Promise<EventEntry | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulEventItem>>('entries', {
    content_type: 'event',
    'fields.slug': slug,
    include: '10',
    limit: '1',
  }, contentfulTags('event', slug), { preview });

  const item = response?.items?.[0];

  if (!item) {
    return null;
  }

  return mapEventItem(item, response?.includes);
}

export async function getPublishedEvents(limit = 1000, preview = false): Promise<EventEntry[]> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulEventItem>>('entries', {
    content_type: 'event',
    include: '10',
    order: 'fields.eventDate',
    limit: String(limit),
  }, contentfulTags('event'), { preview });

  return (response?.items ?? []).map((item) => mapEventItem(item, response?.includes));
}

export async function getPublishedNews(limit = 12, preview = false): Promise<NewsEntry[]> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulNewsItem>>('entries', {
    content_type: 'news',
    include: '2',
    order: '-fields.publishedDate',
    limit: String(limit),
  }, contentfulTags('news'), { preview });

  return (response?.items ?? []).map(mapNewsItem);
}

export async function getPublishedNewsBySlug(slug: string, preview = false): Promise<NewsEntry | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulNewsItem>>('entries', {
    content_type: 'news',
    'fields.slug': slug,
    include: '2',
    limit: '1',
  }, contentfulTags('news', slug), { preview });

  const item = response?.items?.[0];
  return item ? mapNewsItem(item) : null;
}

export async function getPublishedPhotoAlbums(preview = false): Promise<PhotoAlbumEntry[]> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulPhotoAlbumItem>>('entries', {
    content_type: 'photoAlbum', include: '2', order: '-fields.date', limit: '100',
  }, contentfulTags('photoAlbum'), { preview });
  return (response?.items ?? []).map((item) => mapPhotoAlbumItem(item, response?.includes));
}

export async function getPublishedPhotoAlbumBySlug(slug: string, preview = false): Promise<PhotoAlbumEntry | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulPhotoAlbumItem>>('entries', {
    content_type: 'photoAlbum', 'fields.slug': slug, include: '2', limit: '1',
  }, contentfulTags('photoAlbum', slug), { preview });
  return response?.items?.[0] ? mapPhotoAlbumItem(response.items[0], response.includes) : null;
}

export async function getPublishedPageBySlug(slug: string, preview = false): Promise<PageEntry | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulPageItem>>('entries', { content_type: 'page', 'fields.slug': slug, limit: '1' }, contentfulTags('page', slug), { preview });
  return response?.items?.[0] ? mapPageItem(response.items[0]) : null;
}

export async function getContactForm(preview = false): Promise<ContactFormDefinition | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulContactFormItem>>('entries', { content_type: 'contactForm', limit: '1' }, contentfulTags('contactForm'), { preview });
  return response?.items?.[0] ? mapContactFormItem(response.items[0]) : null;
}

export async function getPublishedPersonBySlug(slug: string, preview = false): Promise<PersonEntry | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulPersonItem>>('entries', {
    content_type: 'person',
    'fields.slug': slug,
    include: '2',
    limit: '1',
  }, contentfulTags('person', slug), { preview });

  const item = response?.items?.[0];
  return item ? mapPersonItem(item, response?.includes) : null;
}

export async function getPublishedPeople(preview = false): Promise<PersonEntry[]> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulPersonItem>>('entries', {
    content_type: 'person',
    include: '2',
    order: 'fields.name',
    limit: '100',
  }, contentfulTags('person'), { preview });

  return (response?.items ?? []).map((item) => mapPersonItem(item, response?.includes));
}

export async function getPublishedEventsForPerson(personId: string, preview = false): Promise<EventEntry[]> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulEventItem>>('entries', {
    content_type: 'event',
    links_to_entry: personId,
    include: '2',
    order: 'fields.eventDate',
    limit: '12',
  }, [...contentfulTags('event'), ...contentfulTags('person')], { preview });

  return (response?.items ?? []).map((item) => mapEventItem(item, response?.includes));
}

export async function getSiteSettings(preview = false): Promise<SiteSettingsEntry> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulSiteSettingsItem>>('entries', {
    content_type: 'siteSettings',
    limit: '1',
    include: '10',
  }, contentfulTags('siteSettings'), { preview });

  const item = response?.items?.[0];

  if (!item) {
    return {
      sys: { id: 'default-site-settings' },
      siteName: 'ChessNutZ',
      defaultSeoTitle: 'ChessNutZ',
      defaultSeoDescription: 'Discover upcoming chess tournaments and event details from the content-driven tournament site.',
    };
  }

  return mapSiteSettingsItem(item);
}
