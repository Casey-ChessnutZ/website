const PREVIEW_ORIGIN = 'https://preview.local';
const HOMEPAGE_CONTENT_TYPES = new Set([
  'landingPage', 'siteSettings', 'homeHero', 'richTextSection', 'imageTextSection',
  'featuredEventsSection', 'eventCountdownSection', 'featureCardsSection',
  'imageGallerySection', 'timelineSection', 'quoteSection', 'ctaBannerSection',
  'featureCard', 'timelineItem',
]);

function isRouteSlug(slug: string | undefined): slug is string {
  return Boolean(slug && !slug.includes('/') && !slug.includes('\\'));
}

export function getContentfulPreviewPath(contentType: string | undefined, slug: string | undefined): string | null {
  if (HOMEPAGE_CONTENT_TYPES.has(contentType ?? '')) return '/';
  if (!isRouteSlug(slug)) return null;

  const encodedSlug = encodeURIComponent(slug);
  if (contentType === 'event') return `/events/${encodedSlug}`;
  if (contentType === 'news') return `/news/${encodedSlug}`;
  if (contentType === 'person') return `/team/${encodedSlug}`;
  if (contentType === 'page') return `/page/${encodedSlug}`;
  return null;
}

export function isSafePreviewPath(path: string | null): path is string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return false;
  }

  try {
    const target = new URL(path, PREVIEW_ORIGIN);
    return target.origin === PREVIEW_ORIGIN && !target.pathname.startsWith('/api');
  } catch {
    return false;
  }
}

export function getPreviewRedirectPath(path: string | null): string {
  return isSafePreviewPath(path) ? path : '/';
}
