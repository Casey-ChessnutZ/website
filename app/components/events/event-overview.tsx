import type { EventEntry } from '@/app/lib/contentful/types';
import { formatEventDate } from '@/app/lib/formatting/date';

export default function EventOverview({ event }: { event: EventEntry }) {
  const details = [['Date', formatEventDate(event.eventDate)], ['Location', event.locationName], ['Format', event.format], ['Organiser', event.organizer]].filter(([, value]) => Boolean(value));
  return <section className="mt-12 border-t border-rule pt-8"><h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-none">At a glance</h2><dl className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-px border border-rule bg-rule">{details.map(([label, value]) => <div className="bg-paper-raised p-4" key={label}><dt className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-muted">{label}</dt><dd className="mt-1.5 font-display text-xl">{value}</dd></div>)}</dl>{event.description ? <div className="mt-8 whitespace-pre-wrap leading-[1.8]">{event.description}</div> : null}</section>;
}
