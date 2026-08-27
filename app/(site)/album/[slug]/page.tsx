import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import AlbumViewer from '@/app/components/albums/album-viewer';
import { getPublishedPhotoAlbumBySlug } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

type AlbumPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> { const { slug } = await params; const { isEnabled: preview } = await draftMode(); const album = await getPublishedPhotoAlbumBySlug(slug, preview); return getPageMetadata(album?.title ?? 'Photo album', album?.description, `/album/${slug}`); }

export default async function AlbumDetailPage({ params }: AlbumPageProps) { const { slug } = await params; const { isEnabled: preview } = await draftMode(); const album = await getPublishedPhotoAlbumBySlug(slug, preview); if (!album) notFound(); return <main className="mx-auto max-w-304 px-5 pt-12 pb-28" id="main-content"><AlbumViewer album={album} /></main>; }
