import { getSafeMediaEmbedUrl } from '@/app/lib/media-embed';
import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function MediaEmbedBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; body?: string; url?: string; width?: number; height?: number };
  const url = getSafeMediaEmbedUrl(fields.url);
  const height = Math.min(Math.max(typeof fields.height === 'number' ? fields.height : 760, 320), 1200);
  const maxWidth = Math.min(Math.max(typeof fields.width === 'number' ? fields.width : 1280, 480), 1600);

  return <section className="mx-auto mt-16 max-w-304 px-5"><div className="border-t border-rule pt-8"><div className="mb-8 max-w-172"><p className="mb-3 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">Live information</p><h2 className="mb-4 text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95]">{fields.headline ?? 'Embedded content'}</h2>{fields.body ? <p className="m-0 max-w-152 text-[1.05rem] text-muted">{fields.body}</p> : null}</div>{url ? <div className="overflow-hidden border border-rule bg-paper-raised shadow-editorial" style={{ maxWidth }}><iframe className="block w-full border-0" height={height} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" src={url} title={fields.headline ?? 'Embedded content'} /></div> : <div className="grid min-h-64 max-w-160 place-items-center border border-dashed border-rule bg-paper-raised p-8 text-center text-muted"><p className="m-0">This embed URL is not available or is not from an approved provider.</p></div>}</div></section>;
}
