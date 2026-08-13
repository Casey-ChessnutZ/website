import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function EditorialTextBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as Record<string, unknown>;
  const headline = fields.headline ?? fields.title ?? '';
  const body = fields.body ?? '';

  return (
    <section className="mx-auto mt-28 max-w-304 px-5">
      {typeof headline === 'string' ? <h2 className="max-w-[13ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{headline}</h2> : null}
      {typeof body === 'string' ? <p className="max-w-168 text-muted">{body}</p> : null}
    </section>
  );
}
