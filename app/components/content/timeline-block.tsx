import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function TimelineBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; items?: Array<{ title?: string; description?: string; date?: string }> };
  if (!fields.items?.length) return null;
  return <section className="content-section"><h2>{fields.headline ?? 'Timeline'}</h2><ol className="timeline">{fields.items.map((item, index) => <li key={`${item.title ?? 'item'}-${index}`}><strong>{item.date ? `${item.date} — ` : ''}{item.title}</strong>{item.description ? <p>{item.description}</p> : null}</li>)}</ol></section>;
}
