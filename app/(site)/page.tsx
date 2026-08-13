import RenderBlocks from '@/app/components/content/render-blocks';
import { getPublishedLandingPage } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() {
  const page = await getPublishedLandingPage();
  return getPageMetadata(page?.title ?? 'Chess tournaments', undefined, '/');
}

export default async function HomePage() {
  const page = await getPublishedLandingPage();
  return <main className="overflow-hidden" id="main-content">{page?.sections?.length ? <RenderBlocks sections={page.sections} /> : <p className="mx-auto max-w-304 px-5 py-24 text-muted">Homepage content is being prepared.</p>}</main>;
}
