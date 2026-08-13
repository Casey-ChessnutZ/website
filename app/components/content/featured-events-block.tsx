import Link from 'next/link';
import type { LandingPageBlock } from '@/app/lib/contentful/types';
import { formatEventDate } from '@/app/lib/formatting/date';
import { eventValue, getFeaturedEventIndex, type FeaturedEvent } from './featured-events-data';

export default function FeaturedEventsBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; title?: string; eyebrow?: string; body?: string; featuredEvents?: FeaturedEvent[] };
  const title = fields.headline ?? fields.title ?? 'Featured events';
  const events = fields.featuredEvents ?? [];
  const { lead, remaining } = getFeaturedEventIndex(events);

  const details = (event: FeaturedEvent) => [eventValue(event, 'format'), eventValue(event, 'locationName')].filter((value): value is string => Boolean(value));
  const href = (event: FeaturedEvent) => `/events/${eventValue(event, 'slug') ?? ''}`;

  return (
    <section className="mx-auto mt-28 max-w-304 px-5" aria-labelledby="featured-events-title">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div>{fields.eyebrow ? <p className="mb-3 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">{fields.eyebrow}</p> : null}<h2 className="max-w-[13ch] text-[clamp(2.5rem,5vw,4.6rem)] leading-[0.94]" id="featured-events-title">{title}</h2></div>{fields.body ? <p className="mb-0 max-w-112 text-muted">{fields.body}</p> : null}</div>
      {lead ? <div className="grid border-y border-ink lg:grid-cols-[minmax(0,1.07fr)_minmax(22rem,.93fr)]">
        <Link aria-label={`View ${eventValue(lead, 'title') ?? 'featured event'}`} className="group relative flex min-h-100 flex-col overflow-hidden border-b border-rule bg-ink p-6 text-paper no-underline transition-[background-color,transform] duration-200 ease-editorial hover:bg-oxblood focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-brass active:translate-y-px motion-reduce:transition-none sm:p-8 lg:border-b-0 lg:border-r" href={href(lead)}>
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brass">Featured event</span><div className="mt-auto"><div className="mb-7 flex items-end justify-between gap-4"><time className="border border-brass/70 px-3 py-2 font-display text-2xl leading-none text-paper" dateTime={eventValue(lead, 'eventDate')}>{formatEventDate(eventValue(lead, 'eventDate')) ?? 'Date TBA'}</time><span aria-hidden="true" className="grid size-11 place-items-center rounded-full border border-paper/50 text-lg transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span></div><h3 className="max-w-[12ch] text-[clamp(2.3rem,4vw,4rem)] leading-[0.92]">{eventValue(lead, 'title')}</h3><p className="mb-0 mt-4 max-w-132 text-paper/75">{eventValue(lead, 'summary') ?? 'View tournament details, registration, and key information.'}</p><div className="mt-7 flex flex-wrap gap-2">{details(lead).map((detail) => <span className="border border-paper/35 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-paper/80" key={detail}>{detail}</span>)}</div></div>
        </Link>
        <ol className="m-0 list-none divide-y divide-rule">{[lead, ...remaining].map((event, index) => <li key={event.sys?.id ?? eventValue(event, 'slug') ?? String(index)}><Link aria-label={`View ${eventValue(event, 'title') ?? 'event'}`} className="group grid min-h-28 grid-cols-[2.4rem_minmax(0,1fr)_2.75rem] items-center gap-4 bg-paper-raised p-5 text-ink no-underline transition-[background-color,color] duration-200 ease-editorial hover:bg-white hover:text-oxblood focus-visible:relative focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-oxblood active:bg-paper motion-reduce:transition-none sm:p-6" href={href(event)}><span className="self-start pt-1 text-[0.72rem] font-bold tabular-nums tracking-[0.12em] text-brass">{String(index + 1).padStart(2, '0')}</span><span className="min-w-0"><span className="block text-[0.7rem] font-bold uppercase tracking-[0.13em] text-muted">{formatEventDate(eventValue(event, 'eventDate')) ?? 'Date to be announced'}</span><strong className="mt-2 block font-display text-[clamp(1.45rem,2.3vw,2.1rem)] leading-[0.96]">{eventValue(event, 'title')}</strong><span className="mt-2 block truncate text-sm text-muted">{details(event).join(' · ') || eventValue(event, 'summary') || 'Tournament details'}</span></span><span aria-hidden="true" className="grid size-11 place-items-center rounded-full border border-rule text-oxblood transition-[transform,background-color,color] duration-200 group-hover:translate-x-1 group-hover:bg-oxblood group-hover:text-paper motion-reduce:transition-none">→</span></Link></li>)}</ol>
      </div> : <p className="border-y border-rule py-8 text-muted">Choose one or more events in Contentful to feature them here.</p>}
    </section>
  );
}
