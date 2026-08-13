import { contentfulFetch } from './client';
import { contentfulTags } from './cache-revalidation';
import { mergeSectionBlockFields, resolveEventDivisions, richTextToPlainText, toRichTextDocument } from './mapping';
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
} from './types';

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
    heroHeadline?: string;
    heroDescription?: string;
    featuredEvents?: ContentfulReference[];
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
    status?: 'draft' | 'scheduled' | 'published' | 'archived';
    heroMedia?: ContentfulReference | ContentfulAsset;
    registrationUrl?: string;
    pairingUrl?: string;
    divisions?: ContentfulReference[];
    format?: string;
    schedule?: string;
    prizeInformation?: string;
    eligibility?: string;
    organizer?: string;
    tags?: string[];
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

function mapLandingPageItem(item: ContentfulLandingPageItem, includes: ContentfulCollection<ContentfulLandingPageItem>['includes']): LandingPageEntry {
  const entryMap = includes?.Entry ?? [];

  const sections = (item.fields.sections ?? [])
    .map((reference) => {
      const match = entryMap.find((entry) => entry.sys.id === reference.sys.id);

      if (!match) {
        return null;
      }

      return {
        sys: { id: match.sys.id },
        type:
          (typeof match.fields.blockType === 'string'
            ? (match.fields.blockType as LandingPageBlockType)
            : undefined) ?? 'cardBlock',
        fields: mergeSectionBlockFields(match.fields ?? {}),
      } satisfies LandingPageBlock;
    })
    .filter((section): section is LandingPageBlock => section !== null);

  const featuredEvents = resolveLinkedEntries<EventEntry>(
    item.fields.featuredEvents,
    entryMap,
  ).map((entry) => ({
    sys: { id: entry.sys.id },
    title: typeof entry?.title === 'string' ? entry.title : 'Event',
    slug: typeof entry?.slug === 'string' ? entry.slug : '',
    summary: typeof entry?.summary === 'string' ? entry.summary : undefined,
    description: richTextToPlainText(entry?.description),
    eventDate: typeof entry?.eventDate === 'string' ? entry.eventDate : undefined,
    locationName: typeof entry?.locationName === 'string' ? entry.locationName : undefined,
    locationDetails: typeof entry?.locationDetails === 'string' ? entry.locationDetails : undefined,
    status: entry?.status as EventEntry['status'] | undefined,
    heroMedia: normalizeAsset(entry?.heroMedia as ContentfulReference | ContentfulAsset | undefined),
    registrationUrl: typeof entry?.registrationUrl === 'string' ? entry.registrationUrl : undefined,
    format: typeof entry?.format === 'string' ? entry.format : undefined,
    schedule: typeof entry?.schedule === 'string' ? entry.schedule : undefined,
    prizeInformation: typeof entry?.prizeInformation === 'string' ? entry.prizeInformation : undefined,
    eligibility: typeof entry?.eligibility === 'string' ? entry.eligibility : undefined,
    organizer: typeof entry?.organizer === 'string' ? entry.organizer : undefined,
    tags: Array.isArray(entry?.tags) ? entry.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
  }));

  return {
    sys: item.sys,
    title: item.fields.title ?? 'Landing Page',
    slug: item.fields.slug ?? 'home',
    heroHeadline: item.fields.heroHeadline,
    heroDescription: item.fields.heroDescription,
    featuredEvents: featuredEvents.length ? featuredEvents : undefined,
    sections: sections.length ? sections : undefined,
  };
}

export function mapEventItem(
  item: ContentfulEventItem,
  includes?: ContentfulCollection<ContentfulEventItem>['includes'],
): EventEntry {
  const heroMedia = normalizeAsset(item.fields.heroMedia);

  return {
    sys: item.sys,
    title: item.fields.title ?? 'Event',
    slug: item.fields.slug ?? '',
    summary: item.fields.summary,
    description: richTextToPlainText(item.fields.description),
    eventDate: item.fields.eventDate,
    locationName: item.fields.locationName,
    locationDetails: item.fields.locationDetails,
    status: item.fields.status,
    heroMedia,
    registrationUrl: item.fields.registrationUrl,
    pairingUrl: item.fields.pairingUrl,
    divisions: resolveEventDivisions(item.fields.divisions, includes?.Entry).map((division) => ({
      ...division,
      status: division.status as EventEntry['status'] | undefined,
    })),
    format: item.fields.format,
    schedule: item.fields.schedule,
    prizeInformation: item.fields.prizeInformation,
    eligibility: item.fields.eligibility,
    organizer: item.fields.organizer,
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
  };
}

export async function getPublishedLandingPage(): Promise<LandingPageEntry | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulLandingPageItem>>('entries', {
    content_type: 'landingPage',
    'fields.slug': 'home',
    order: '-sys.updatedAt',
    include: '10',
    limit: '1',
  }, [...contentfulTags('landingPage'), ...contentfulTags('sectionBlock'), ...contentfulTags('event')]);

  const item = response?.items?.[0];

  if (!item) {
    return null;
  }

  return mapLandingPageItem(item, response?.includes);
}

export async function getPublishedEventBySlug(slug: string): Promise<EventEntry | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulEventItem>>('entries', {
    content_type: 'event',
    'fields.slug': slug,
    include: '10',
    limit: '1',
  }, contentfulTags('event', slug));

  const item = response?.items?.[0];

  if (!item) {
    return null;
  }

  return mapEventItem(item, response?.includes);
}

export async function getPublishedEvents(limit = 6): Promise<EventEntry[]> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulEventItem>>('entries', {
    content_type: 'event',
    include: '10',
    order: 'fields.eventDate',
    limit: String(limit),
  }, contentfulTags('event'));

  return (response?.items ?? []).map((item) => mapEventItem(item, response?.includes));
}

export async function getPublishedNews(limit = 12): Promise<NewsEntry[]> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulNewsItem>>('entries', {
    content_type: 'news',
    include: '2',
    order: '-fields.publishedDate',
    limit: String(limit),
  }, contentfulTags('news'));

  return (response?.items ?? []).map(mapNewsItem);
}

export async function getPublishedNewsBySlug(slug: string): Promise<NewsEntry | null> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulNewsItem>>('entries', {
    content_type: 'news',
    'fields.slug': slug,
    include: '2',
    limit: '1',
  }, contentfulTags('news', slug));

  const item = response?.items?.[0];
  return item ? mapNewsItem(item) : null;
}

export async function getSiteSettings(): Promise<SiteSettingsEntry> {
  const response = await contentfulFetch<ContentfulCollection<ContentfulSiteSettingsItem>>('entries', {
    content_type: 'siteSettings',
    limit: '1',
    include: '10',
  }, contentfulTags('siteSettings'));

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
