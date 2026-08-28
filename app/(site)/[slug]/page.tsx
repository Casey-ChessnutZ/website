import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import RenderBlocks from '@/app/components/content/render-blocks';
import { getPublishedLandingPageBySlug } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

type LandingPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> { const { slug } = await params; const { isEnabled: preview } = await draftMode(); const page = await getPublishedLandingPageBySlug(slug, preview); return getPageMetadata(page?.title ?? 'Page', undefined, `/${slug}`); }

export default async function LandingPage({ params }: LandingPageProps) { const { slug } = await params; const { isEnabled: preview } = await draftMode(); const page = await getPublishedLandingPageBySlug(slug, preview); if (!page) notFound(); return <main className="overflow-hidden pb-28" id="main-content"><header className="mx-auto max-w-304 px-5 pt-18"><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">Chessnutz</p><h1 className="m-0 max-w-200 text-[clamp(3.5rem,9vw,7rem)] leading-[0.88]">{page.title}</h1></header>{page.sections?.length ? <RenderBlocks sections={page.sections} /> : null}</main>; }
