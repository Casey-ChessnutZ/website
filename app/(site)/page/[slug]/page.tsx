import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';

import NewsRichText from '@/app/components/news/news-rich-text';
import { getPublishedPageBySlug } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const page = await getPublishedPageBySlug(slug, preview);
  return getPageMetadata(page?.seoTitle ?? page?.title ?? 'Page', page?.seoDescription ?? page?.summary, `/page/${slug}`);
}

export default async function GenericPage({ params }: PageProps) {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const page = await getPublishedPageBySlug(slug, preview);
  if (!page) notFound();
  return <main className="mx-auto max-w-224 px-5 pt-12 pb-28" id="main-content"><article><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">Information</p><h1 className="mb-6 text-[clamp(3rem,7vw,6rem)] leading-[0.93]">{page.title}</h1>{page.summary ? <p className="max-w-152 text-xl text-muted">{page.summary}</p> : null}{page.content ? <div className="mt-12 border-t border-rule pt-8"><NewsRichText document={page.content} /></div> : null}</article></main>;
}
