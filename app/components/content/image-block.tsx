import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function ImageBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; body?: string; media?: { url?: string; title?: string; fields?: { file?: { url?: string }; title?: string } } };
  const url = fields.media?.url ?? fields.media?.fields?.file?.url;
  if (!url) return null;
  return <section className="content-section"><img className="feature-image" src={url.startsWith('//') ? `https:${url}` : url} alt={fields.media?.title ?? fields.media?.fields?.title ?? fields.headline ?? ''} />{fields.headline ? <h2>{fields.headline}</h2> : null}{fields.body ? <p>{fields.body}</p> : null}</section>;
}
