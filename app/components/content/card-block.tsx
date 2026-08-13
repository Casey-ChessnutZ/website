import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function CardBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; cards?: Array<{ title?: string; body?: string }> };
  if (!fields.cards?.length) return null;
  return <section className="content-section"><h2>{fields.headline ?? 'Highlights'}</h2><div className="card-grid">{fields.cards.map((card, index) => <article className="card" key={`${card.title ?? 'card'}-${index}`}><h3>{card.title}</h3>{card.body ? <p>{card.body}</p> : null}</article>)}</div></section>;
}
