import RenderBlocks from '@/app/components/content/render-blocks';
import { getPublishedLandingPage } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() {
  const { isEnabled: preview } = await draftMode();
  const page = await getPublishedLandingPage(preview);
  return getPageMetadata(page?.title ?? 'Chess tournaments', undefined, '/');
}

export default async function HomePage() {
  const { isEnabled: preview } = await draftMode();
  const page = await getPublishedLandingPage(preview);
  return <main className="overflow-hidden" id="main-content">{page?.sections?.length ? <RenderBlocks sections={page.sections} /> : <p className="mx-auto max-w-304 px-5 py-24 text-muted">Homepage content is being prepared.</p>}</main>;
}
import { draftMode } from 'next/headers';
