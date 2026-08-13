import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventLocation({ event }: { event: EventEntry }) {
  return event.locationDetails ? <section className="event-section"><h2>Venue</h2><p>{event.locationDetails}</p></section> : null;
}
