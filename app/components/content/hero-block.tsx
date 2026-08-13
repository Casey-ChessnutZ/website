import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function HeroBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as Record<string, unknown>;
  const headline = fields.headline ?? fields.title ?? '';
  const body = fields.body ?? fields.heroDescription ?? '';

  return (
    <section className="mx-auto mt-28 max-w-304 bg-ink px-5 py-18 text-paper">
      {typeof headline === 'string' ? <h2 className="max-w-[15ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{headline}</h2> : null}
      {typeof body === 'string' ? <p className="max-w-144">{body}</p> : null}
    </section>
  );
}
