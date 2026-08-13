import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function ImageBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; body?: string; media?: { url?: string; title?: string; fields?: { file?: { url?: string }; title?: string } } };
  const url = fields.media?.url ?? fields.media?.fields?.file?.url;
  return <section className="mx-auto mt-28 grid max-w-304 gap-8 px-5 md:grid-cols-2 md:items-center">{url ? <img className="aspect-4/3 w-full object-cover" src={url.startsWith('//') ? `https:${url}` : url} alt={fields.media?.title ?? fields.media?.fields?.title ?? fields.headline ?? ''} /> : <div className="grid aspect-4/3 place-items-center border border-dashed border-rule bg-paper-raised p-8 text-center text-muted">Add an image in Contentful to complete this story.</div>}<div>{fields.headline ? <h2 className="max-w-[13ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{fields.headline}</h2> : null}{fields.body ? <p className="max-w-168 text-muted">{fields.body}</p> : null}</div></section>;
}
