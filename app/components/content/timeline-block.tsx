import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function TimelineBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; items?: Array<{ title?: string; description?: string; date?: string }> };
  if (!fields.items?.length) return null;
  return <section className="mx-auto mt-28 max-w-304 px-5"><h2 className="max-w-[13ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{fields.headline ?? 'Timeline'}</h2><ol className="m-0 list-none border-l border-oxblood pl-6">{fields.items.map((item, index) => <li className="pb-6" key={`${item.title ?? 'item'}-${index}`}><strong className="font-display text-2xl font-semibold">{item.date ? `${item.date} — ` : ''}{item.title}</strong>{item.description ? <p>{item.description}</p> : null}</li>)}</ol></section>;
}
