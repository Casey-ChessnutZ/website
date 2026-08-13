import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventSchedule({ event }: { event: EventEntry }) {
  return event.schedule ? <section className="mt-12 border-t border-rule pt-8"><h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-none">Schedule</h2><p>{event.schedule}</p></section> : null;
}
