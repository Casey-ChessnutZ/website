export type ContentfulCacheType = 'event' | 'news' | 'page' | 'landingPage' | 'siteSettings' | 'person' | 'homeHero' | 'richTextSection' | 'imageTextSection' | 'featuredEventsSection' | 'eventCountdownSection' | 'featureCardsSection' | 'imageGallerySection' | 'timelineSection' | 'quoteSection' | 'ctaBannerSection' | 'featureCard' | 'timelineItem';

export type ContentfulRevalidationPath = {
  path: string;
  type: 'page' | 'layout';
};

export type ContentfulRevalidationPlan = {
  tags: string[];
  paths: ContentfulRevalidationPath[];
};

type ContentfulWebhookPayload = {
  sys?: {
    contentType?: {
      sys?: {
        id?: unknown;
      };
    };
  };
  fields?: {
    slug?: unknown;
  };
};

const supportedTypes = new Set<ContentfulCacheType>(['event', 'news', 'page', 'landingPage', 'siteSettings', 'person', 'homeHero', 'richTextSection', 'imageTextSection', 'featuredEventsSection', 'eventCountdownSection', 'featureCardsSection', 'imageGallerySection', 'timelineSection', 'quoteSection', 'ctaBannerSection', 'featureCard', 'timelineItem']);

export function contentfulTags(type: ContentfulCacheType, slug?: string): string[] {
  return [`contentful:${type}`, ...(slug ? [`contentful:${type}:${slug}`] : [])];
}

function isContentfulCacheType(value: unknown): value is ContentfulCacheType {
  return typeof value === 'string' && supportedTypes.has(value as ContentfulCacheType);
}

function getSlug(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object') return undefined;

  const localizedSlug = Object.values(value as Record<string, unknown>).find(
    (candidate): candidate is string => typeof candidate === 'string' && Boolean(candidate.trim()),
  );

  return localizedSlug?.trim();
}

export function createContentfulRevalidationPlan(payload: ContentfulWebhookPayload): ContentfulRevalidationPlan | null {
  const type = payload.sys?.contentType?.sys?.id;

  if (!isContentfulCacheType(type)) return null;

  const slug = getSlug(payload.fields?.slug);

  if (type === 'event') {
    return {
      tags: contentfulTags(type, slug),
      paths: [
        { path: '/', type: 'page' },
        { path: '/events', type: 'page' },
        ...(slug ? [{ path: `/events/${slug}`, type: 'page' as const }] : []),
        { path: '/events/[slug]', type: 'page' },
      ],
    };
  }

  if (type === 'news') {
    return {
      tags: contentfulTags(type, slug),
      paths: [
        { path: '/news', type: 'page' },
        ...(slug ? [{ path: `/news/${slug}`, type: 'page' as const }] : []),
        { path: '/news/[slug]', type: 'page' },
      ],
    };
  }

  if (type === 'page') {
    return { tags: contentfulTags(type, slug), paths: [...(slug ? [{ path: `/page/${slug}`, type: 'page' as const }] : []), { path: '/page/[slug]', type: 'page' }] };
  }

  if (type === 'person') {
    return {
      tags: [...contentfulTags(type, slug), ...contentfulTags('event')],
      paths: [
        { path: '/', type: 'page' },
        { path: '/events', type: 'page' },
        { path: '/events/[slug]', type: 'page' },
        { path: '/team', type: 'page' },
        ...(slug ? [{ path: `/team/${slug}`, type: 'page' as const }] : []),
        { path: '/team/[slug]', type: 'page' },
      ],
    };
  }

  if (type === 'landingPage' || ['homeHero', 'richTextSection', 'imageTextSection', 'featuredEventsSection', 'eventCountdownSection', 'featureCardsSection', 'imageGallerySection', 'timelineSection', 'quoteSection', 'ctaBannerSection', 'featureCard', 'timelineItem'].includes(type)) {
    return { tags: contentfulTags(type, slug), paths: [{ path: '/', type: 'page' }] };
  }

  return { tags: contentfulTags(type), paths: [{ path: '/', type: 'layout' }] };
}
