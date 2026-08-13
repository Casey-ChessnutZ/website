import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventOverview({ event }: { event: EventEntry }) {
  const details = [['Date', event.eventDate], ['Location', event.locationName], ['Format', event.format], ['Organiser', event.organizer]].filter(([, value]) => Boolean(value));
  return <section className="event-section"><h2>At a glance</h2><dl className="event-details">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{event.description ? <div className="event-description">{event.description}</div> : null}</section>;
}
