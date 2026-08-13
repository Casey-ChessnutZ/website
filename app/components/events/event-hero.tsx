import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventHero({ event }: { event: EventEntry }) {
  return <header className="event-hero">{event.heroMedia?.url ? <img src={event.heroMedia.url} alt={event.heroMedia.title ?? event.title} /> : null}<p className="eyebrow">{event.status ?? 'Upcoming tournament'}</p><h1>{event.title}</h1>{event.summary ? <p className="lede">{event.summary}</p> : null}</header>;
}
