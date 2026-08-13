import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function ImageBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; body?: string; media?: { url?: string; title?: string; fields?: { file?: { url?: string }; title?: string } } };
  const url = fields.media?.url ?? fields.media?.fields?.file?.url;
  if (!url) return null;
  return <section className="mx-auto mt-28 max-w-304 px-5"><img className="max-h-152 w-full object-cover" src={url.startsWith('//') ? `https:${url}` : url} alt={fields.media?.title ?? fields.media?.fields?.title ?? fields.headline ?? ''} />{fields.headline ? <h2 className="max-w-[13ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{fields.headline}</h2> : null}{fields.body ? <p className="max-w-168 text-muted">{fields.body}</p> : null}</section>;
}
