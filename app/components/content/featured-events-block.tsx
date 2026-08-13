import Link from 'next/link';
import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function FeaturedEventsBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; title?: string; featuredEvents?: Array<{ sys?: { id?: string }; slug?: string; title?: string; summary?: string; fields?: { title?: string; summary?: string; slug?: string } }> };
  const title = fields.headline ?? fields.title ?? 'Featured events';
  // The block may include resolved event references in some setups; defensively accept an array.
  const events = fields.featuredEvents ?? [];

  return (
    <section className="content-section">
      <h2>{title}</h2>
      {events.length ? (
        <div className="card-grid">
          {events.map((e) => (
            <Link key={e.sys?.id ?? e.slug ?? e.fields?.slug ?? e.title ?? 'event'} href={`/events/${e.slug ?? e.fields?.slug ?? ''}`}>
              <article className="card">
                <strong>{e.title ?? e.fields?.title}</strong>
                <div style={{ marginTop: 6 }}>{e.summary ?? e.fields?.summary}</div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <p>No featured events configured.</p>
      )}
    </section>
  );
}
