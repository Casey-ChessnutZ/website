import type { LandingPageBlock } from '@/app/lib/contentful/types';

type Image = { url?: string; title?: string; fields?: { file?: { url?: string }; title?: string } };

export default function ImageGalleryBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; images?: Image[] };
  const images = fields.images ?? [];
  if (!images.length) return null;
  return <section className="mx-auto mt-28 max-w-304 px-5"><h2 className="max-w-[13ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{fields.headline ?? 'Gallery'}</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-3">{images.map((image, index) => { const url = image.url ?? image.fields?.file?.url; return url ? <img className={index === 1 ? 'aspect-4/5 object-cover md:mt-8' : 'aspect-4/5 object-cover'} key={url} src={url.startsWith('//') ? `https:${url}` : url} alt={image.title ?? image.fields?.title ?? `Tournament image ${index + 1}`} /> : null; })}</div></section>;
}
