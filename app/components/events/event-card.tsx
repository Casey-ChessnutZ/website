import Link from 'next/link';

import type { EventEntry } from '@/app/lib/contentful/types';

import { getEventCardDate } from './event-card-data';

export default function EventCard({ event }: { event: EventEntry }) {
  const date = getEventCardDate(event.eventDate);
  const details = [event.format, event.locationName].filter((value): value is string => Boolean(value));

  return (
    <Link
      aria-label={`View ${event.title}`}
      className="group relative flex min-h-80 min-w-0 flex-col overflow-hidden border border-rule bg-paper-raised p-5 text-ink no-underline shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9)] transition-[transform,background-color,box-shadow,border-color] duration-200 ease-editorial hover:-translate-y-1 hover:border-brass hover:bg-white hover:shadow-editorial active:translate-y-0 active:shadow-none sm:p-6"
      href={`/events/${event.slug}`}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-oxblood transition-transform duration-200 ease-editorial group-hover:scale-x-100" />
      <div className="flex items-start justify-between gap-4">
        {date ? (
          <time className="grid size-16 shrink-0 place-items-center border border-brass/55 bg-paper text-center font-sans leading-none" dateTime={event.eventDate}>
            <span className="pt-1 text-[0.68rem] font-bold tracking-[0.16em] text-oxblood">{date.month}</span>
            <span className="pb-1 font-display text-[2.25rem] tracking-[-0.06em] text-ink">{date.day}</span>
          </time>
        ) : (
          <span className="inline-flex min-h-8 items-center border border-rule px-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted">Date TBA</span>
        )}
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-rule text-oxblood transition-[color,background-color,transform] duration-200 ease-editorial group-hover:translate-x-1 group-hover:bg-oxblood group-hover:text-paper" aria-hidden="true">
          <svg fill="none" height="19" viewBox="0 0 24 24" width="19" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>
        </span>
      </div>
      <div className="mt-7">
        <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brass">{date?.label ?? 'Date to be announced'}</p>
        <h2 className="mb-3 text-[clamp(2rem,3vw,2.75rem)] leading-[0.94]">{event.title}</h2>
        <p className="mb-0 line-clamp-3 text-[0.98rem] text-muted">{event.summary ?? 'View tournament details, registration, and key information.'}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-7">
        {details.length ? details.slice(0, 2).map((detail) => <span className="border border-rule/85 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-muted" key={detail}>{detail}</span>) : <span className="text-sm font-bold text-oxblood">Tournament details</span>}
      </div>
      <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-oxblood">View event <span className="sr-only">: {event.title}</span><span aria-hidden="true">Details</span></span>
    </Link>
  );
}
