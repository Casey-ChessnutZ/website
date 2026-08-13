import Link from 'next/link';

import type { EventEntry } from '@/app/lib/contentful/types';
import { formatEventDate } from '@/app/lib/formatting/date';

export default function EventDivisions({ event }: { event: EventEntry }) {
  if (!event.divisions?.length) return null;

  return <section className="mt-12 border-t border-rule pt-8"><h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-none">Divisions</h2><div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-px border border-rule bg-rule">{event.divisions.map((division) => <Link className="min-w-0 bg-paper-raised p-6 no-underline transition duration-200 ease-editorial hover:-translate-y-0.5 hover:bg-white" href={`/events/${division.slug}`} key={division.sys.id}><p className="mb-1.5 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">{formatEventDate(division.eventDate) ?? 'Date to be announced'}</p><h3 className="text-[1.7rem] leading-[1.02]">{division.title}</h3>{division.format ? <p className="mb-0 text-muted">{division.format}</p> : null}</Link>)}</div></section>;
}
