import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function EditorialTextBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as Record<string, unknown>;
  const headline = fields.headline ?? fields.title ?? '';
  const body = fields.body ?? '';

  return (
    <section className="content-section">
      {typeof headline === 'string' ? <h2>{headline}</h2> : null}
      {typeof body === 'string' ? <p>{body}</p> : null}
    </section>
  );
}
