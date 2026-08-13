import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function HeroBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as Record<string, unknown>;
  const headline = fields.headline ?? fields.title ?? '';
  const body = fields.body ?? fields.heroDescription ?? '';

  return (
    <section className="content-section callout">
      {typeof headline === 'string' ? <h2>{headline}</h2> : null}
      {typeof body === 'string' ? <p>{body}</p> : null}
    </section>
  );
}
