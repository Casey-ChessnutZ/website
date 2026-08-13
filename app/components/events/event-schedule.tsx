import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventSchedule({ event }: { event: EventEntry }) {
  return event.schedule ? <section className="event-section"><h2>Schedule</h2><p>{event.schedule}</p></section> : null;
}
