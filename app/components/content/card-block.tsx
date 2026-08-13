import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function CardBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; cards?: Array<{ title?: string; body?: string }> };
  if (!fields.cards?.length) return null;
  return <section className="mx-auto mt-28 max-w-304 px-5"><h2 className="max-w-[13ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{fields.headline ?? 'Highlights'}</h2><div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-px border border-rule bg-rule">{fields.cards.map((card, index) => <article className="min-w-0 bg-paper-raised p-6 transition duration-200 ease-editorial hover:-translate-y-0.5 hover:bg-white" key={`${card.title ?? 'card'}-${index}`}><h3 className="text-[1.7rem] leading-[1.02]">{card.title}</h3>{card.body ? <p>{card.body}</p> : null}</article>)}</div></section>;
}
