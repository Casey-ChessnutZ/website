import type { Metadata } from 'next';
import Link from 'next/link';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import NewsRichText from '@/app/components/news/news-rich-text';
import { formatEventDate } from '@/app/lib/formatting/date';
import { getPublishedNewsBySlug } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

type NewsPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> { const { slug } = await params; const { isEnabled: preview } = await draftMode(); const entry = await getPublishedNewsBySlug(slug, preview); return getPageMetadata(entry?.title ?? 'News', entry?.summary, `/news/${slug}`); }

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const entry = await getPublishedNewsBySlug(slug, preview);
  if (!entry) notFound();
  return <main className="mx-auto max-w-224 px-5 pt-12 pb-28" id="main-content"><Link className="inline-flex min-h-11 items-center text-sm font-bold text-oxblood no-underline" href="/news">← All news</Link><article className="mt-10"><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">{formatEventDate(entry.publishedDate) ?? 'News update'}</p><h1 className="mb-6 text-[clamp(3rem,7vw,6rem)] leading-[0.93]">{entry.title}</h1>{entry.summary ? <p className="max-w-152 text-xl text-muted">{entry.summary}</p> : null}{entry.tags?.length ? <p className="mt-6 text-sm font-bold text-muted">{entry.tags.join(' · ')}</p> : null}<div className="mt-12 border-t border-rule pt-8"><NewsRichText document={entry.content} /></div></article></main>;
}
