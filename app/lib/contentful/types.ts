import type { Document } from '@contentful/rich-text-types';

export type ContentfulAsset = {
  sys?: {
    id?: string;
  };
  url?: string;
  title?: string;
  description?: string;
  fields?: {
    file?: {
      url?: string;
      contentType?: string;
      details?: { size?: number };
    };
    title?: string;
    description?: string;
  };
};

export type ContentfulReference = {
  sys: {
    id: string;
    type: 'Link';
    linkType: 'Entry' | 'Asset';
  };
};

export type ContentfulEntry<TFields> = {
  sys: {
    id: string;
    contentType?: {
      sys?: {
        id?: string;
      };
    };
  };
  fields: TFields;
};

export type LandingPageBlockType =
  | 'hero'
  | 'featuredEvents'
  | 'imageGallery'
  | 'timeline'
  | 'cta'
  | 'countdown'
  | 'imageBlock'
  | 'cardBlock'
  | 'editorialText'
  | 'bannerCallout'
  | 'stats'
  | 'sponsorStrip'
  | 'faq'
  | 'mediaTextSplit';

export type LandingPageBlock = {
  sys: {
    id: string;
  };
  type: LandingPageBlockType;
  fields: Record<string, unknown>;
};

export type LandingPageEntry = {
  sys: {
    id: string;
  };
  title: string;
  slug: string;
  heroHeadline?: string;
  heroDescription?: string;
  featuredEvents?: EventEntry[];
  sections?: LandingPageBlock[];
};

export type SectionBlockEntry = {
  sys: {
    id: string;
  };
  title?: string;
  blockType?: LandingPageBlockType;
  headline?: string;
  body?: string;
  media?: ContentfulAsset;
  ctaText?: string;
  ctaUrl?: string;
};

export type SiteSettingsEntry = {
  sys: {
    id: string;
  };
  siteName?: string;
  logo?: ContentfulAsset;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  footerText?: string;
  socialLinks?: Array<{ label?: string; url?: string }>;
  navigationConfig?: { items?: Array<{ label?: string; href?: string; style?: 'primary' | 'text'; enabled?: boolean }> };
};

export type EventEntry = {
  sys: {
    id: string;
  };
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  eventDate?: string;
  locationName?: string;
  locationDetails?: string;
  venueAddress?: string;
  venueLocation?: { lat: number; lon: number };
  venueNotes?: string;
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  heroMedia?: ContentfulAsset;
  registrationUrl?: string;
  pairingUrl?: string;
  documents?: ContentfulAsset[];
  divisions?: EventEntry[];
  relatedEvents?: EventEntry[];
  format?: string;
  schedule?: string;
  scheduleItems?: Array<{ time: string; title: string; detail?: string }>;
  prizeInformation?: string;
  eligibility?: string;
  organizer?: string;
  officials?: PersonEntry[];
  tags?: string[];
};

export type PersonEntry = {
  sys: { id: string };
  name: string;
  slug: string;
  title?: string;
  fideProfileUrl?: string;
  about?: string;
  image?: ContentfulAsset;
  federation?: string;
  location?: string;
};

export type NewsEntry = {
  sys: { id: string };
  title: string;
  slug: string;
  summary?: string;
  publishedDate?: string;
  tags?: string[];
  content?: Document;
};
