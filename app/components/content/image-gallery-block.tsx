import type { LandingPageBlock } from '@/app/lib/contentful/types';

type Image = { url?: string; title?: string; fields?: { file?: { url?: string }; title?: string } };

export default function ImageGalleryBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; images?: Image[] };
  const images = fields.images ?? [];
  if (!images.length) return null;
  return <section className="content-section"><h2>{fields.headline ?? 'Gallery'}</h2><div className="image-gallery">{images.map((image, index) => { const url = image.url ?? image.fields?.file?.url; return url ? <img key={url} src={url.startsWith('//') ? `https:${url}` : url} alt={image.title ?? image.fields?.title ?? `Tournament image ${index + 1}`} /> : null; })}</div></section>;
}
