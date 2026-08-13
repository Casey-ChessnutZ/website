import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventHero({ event }: { event: EventEntry }) {
  return <header className="mt-12">{event.heroMedia?.url ? <img className="mb-8 max-h-136 w-full object-cover" src={event.heroMedia.url} alt={event.heroMedia.title ?? event.title} /> : null}<p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">{event.status ?? 'Upcoming tournament'}</p><h1 className="my-1.5 text-[clamp(3rem,7vw,6rem)] leading-[0.93]">{event.title}</h1>{event.summary ? <p className="max-w-152 text-xl text-muted">{event.summary}</p> : null}</header>;
}
