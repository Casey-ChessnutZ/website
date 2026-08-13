import Link from 'next/link';

import { formatEventDate } from '@/app/lib/formatting/date';
import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventRelatedEvents({ event }: { event: EventEntry }) {
  if (!event.relatedEvents?.length) return null;

  return <section className="scroll-mt-28 border-t border-rule pt-8" id="related-events"><p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brass">From the archive</p><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><h2 className="text-[clamp(2.3rem,5vw,4rem)] leading-none">Related events</h2><p className="m-0 max-w-96 text-muted">Revisit previous editions and connected tournaments.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2">{event.relatedEvents.map((relatedEvent) => <Link className="group relative overflow-hidden border border-rule bg-paper-raised p-6 text-ink no-underline transition-[transform,border-color,box-shadow] duration-200 ease-editorial hover:-translate-y-0.5 hover:border-brass hover:shadow-editorial" href={`/events/${relatedEvent.slug}`} key={relatedEvent.sys.id}><p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brass">{formatEventDate(relatedEvent.eventDate) ?? 'Tournament archive'}</p><h3 className="mt-4 max-w-120 text-[2rem] leading-[0.94]">{relatedEvent.title}</h3>{relatedEvent.summary ? <p className="mt-4 max-w-112 text-muted">{relatedEvent.summary}</p> : null}<span aria-hidden="true" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-oxblood">View event <svg className="size-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg></span></Link>)}</div></section>;
}
