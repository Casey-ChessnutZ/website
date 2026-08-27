import Link from 'next/link';

import { formatEventDate } from '@/app/lib/formatting/date';
import type { PhotoAlbumEntry } from '@/app/lib/contentful/types';

export function PhotoAlbumCard({ album }: { album: PhotoAlbumEntry }) {
  const cover = album.images[0];
  return <article className="group border-t border-rule pt-4"><Link className="block no-underline" href={`/album/${album.slug}`}><div className="relative aspect-[4/3] overflow-hidden bg-ink"><AlbumImage asset={cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" /><div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" /></div><div className="grid gap-3 pt-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"><div><p className="mb-2 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">{formatEventDate(album.date) ?? 'Photo album'}</p><h2 className="m-0 text-[clamp(2rem,4vw,3.4rem)] leading-[0.92] text-ink transition-colors group-hover:text-oxblood">{album.title}</h2></div><p className="m-0 text-sm font-bold text-muted">{album.images.length} {album.images.length === 1 ? 'photograph' : 'photographs'} <span aria-hidden="true">↗</span></p></div>{album.description ? <p className="mb-0 mt-4 max-w-120 text-muted">{album.description}</p> : null}</Link></article>;
}

export default function AlbumViewer({ album }: { album: PhotoAlbumEntry }) {
  return <article><header className="max-w-172 border-b border-rule pb-10"><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">{formatEventDate(album.date) ?? 'Photo album'} · {album.images.length} {album.images.length === 1 ? 'photograph' : 'photographs'}</p><h1 className="mb-6 text-[clamp(3.5rem,9vw,7rem)] leading-[0.88]">{album.title}</h1>{album.description ? <p className="m-0 max-w-152 text-[1.15rem] text-muted">{album.description}</p> : null}</header>{album.images.length ? <section aria-label={`${album.title} photographs`} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{album.images.map((asset, index) => <figure className={`group relative m-0 overflow-hidden bg-ink ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`} key={asset.sys?.id ?? `${asset.url}-${index}`}><AlbumImage alt={asset.description ?? asset.title ?? `${album.title} photograph ${index + 1}`} asset={asset} className={`w-full object-cover transition duration-500 group-hover:scale-[1.02] ${index === 0 ? 'aspect-[4/3] sm:h-full' : 'aspect-[4/3]'}`} /><figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent px-4 pb-3 pt-12 text-sm text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100">{asset.title ?? `Photograph ${index + 1}`}</figcaption></figure>)}</section> : <div className="mt-8 border border-dashed border-rule bg-paper-raised p-8"><p className="m-0 text-muted">Photographs will be added soon.</p></div>}<Link className="mt-12 inline-flex min-h-11 items-center text-sm font-bold text-oxblood no-underline" href="/album">← All albums</Link></article>;
}

function AlbumImage({ asset, alt, className }: { asset?: PhotoAlbumEntry['images'][number]; alt: string; className: string }) {
  return asset?.url ? <img alt={alt} className={className} src={asset.url} /> : <div aria-hidden="true" className={`${className} grid place-items-center bg-ink text-4xl text-brass`}>♞</div>;
}
