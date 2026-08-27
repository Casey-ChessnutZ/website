import { draftMode } from 'next/headers';

import { PhotoAlbumCard } from '@/app/components/albums/album-viewer';
import { getPublishedPhotoAlbums } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() { return getPageMetadata('Photo albums', 'Tournament and community moments from Chessnutz events.', '/album'); }

export default async function AlbumPage() {
  const { isEnabled: preview } = await draftMode();
  const albums = await getPublishedPhotoAlbums(preview);
  return <main className="mx-auto max-w-304 px-5 pt-12 pb-28" id="main-content"><section className="max-w-172 py-12 pb-18"><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">From the tournament room</p><h1 className="mb-6 text-[clamp(3.5rem,9vw,7rem)] leading-[0.9]">At the board.</h1><p className="max-w-152 text-[1.15rem] text-muted">A growing record of tournament days, quiet calculations, and the people behind the pieces.</p></section>{albums.length ? <div className="grid gap-x-8 gap-y-12 md:grid-cols-2">{albums.map((album) => <PhotoAlbumCard album={album} key={album.sys.id} />)}</div> : <div className="border border-dashed border-rule bg-paper-raised p-8"><p className="m-0 text-muted">There are no published photo albums yet.</p></div>}</main>;
}
