import Link from 'next/link';
import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function FeaturedEventsBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; title?: string; featuredEvents?: Array<{ sys?: { id?: string }; slug?: string; title?: string; summary?: string; fields?: { title?: string; summary?: string; slug?: string } }> };
  const title = fields.headline ?? fields.title ?? 'Featured events';
  // The block may include resolved event references in some setups; defensively accept an array.
  const events = fields.featuredEvents ?? [];

  return (
    <section className="mx-auto mt-28 max-w-304 px-5">
      <h2 className="max-w-[13ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{title}</h2>
      {events.length ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-px border border-rule bg-rule">
          {events.map((e) => (
            <Link className="min-w-0 bg-paper-raised p-6 no-underline transition duration-200 ease-editorial hover:-translate-y-0.5 hover:bg-white" key={e.sys?.id ?? e.slug ?? e.fields?.slug ?? e.title ?? 'event'} href={`/events/${e.slug ?? e.fields?.slug ?? ''}`}>
              <article>
                <strong>{e.title ?? e.fields?.title}</strong>
                <div className="mt-1.5">{e.summary ?? e.fields?.summary}</div>
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
