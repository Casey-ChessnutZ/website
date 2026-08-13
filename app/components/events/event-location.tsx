import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventLocation({ event }: { event: EventEntry }) {
  return event.locationDetails ? <section className="mt-12 border-t border-rule pt-8"><h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-none">Venue</h2><p>{event.locationDetails}</p></section> : null;
}
