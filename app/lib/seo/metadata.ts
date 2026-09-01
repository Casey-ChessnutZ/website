import type { Metadata } from 'next';

import { getSiteSettings } from '@/app/lib/contentful/queries';
import { siteMetadataAssets } from './site-metadata-assets';

export async function getPageMetadata(
  title?: string,
  description?: string,
  path = '/',
): Promise<Metadata> {
  const siteSettings = await getSiteSettings();

  const pageTitle = title
    ? `${title} | ${siteSettings.siteName ?? 'ChessNutZ'}`
    : siteSettings.defaultSeoTitle ?? siteSettings.siteName ?? 'ChessNutZ';

  const pageDescription = description ?? siteSettings.defaultSeoDescription;

  return {
    ...siteMetadataAssets,
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription ?? undefined,
      type: 'website',
      url: path,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription ?? undefined,
    },
  };
}
