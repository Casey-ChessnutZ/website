const approvedEmbedOrigins = new Set(['www.youtube.com', 'www.youtube-nocookie.com', 'www.google.com', 'maps.google.com', 'docs.google.com']);

export function getSafeMediaEmbedUrl(value?: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !approvedEmbedOrigins.has(url.hostname)) return null;
    if (url.hostname === 'docs.google.com' && !url.pathname.startsWith('/spreadsheets/')) return null;
    if ((url.hostname === 'www.youtube.com' || url.hostname === 'www.youtube-nocookie.com') && !url.pathname.startsWith('/embed/')) return null;
    if ((url.hostname === 'www.google.com' || url.hostname === 'maps.google.com') && !url.pathname.startsWith('/maps/')) return null;
    return url.toString();
  } catch {
    return null;
  }
}
