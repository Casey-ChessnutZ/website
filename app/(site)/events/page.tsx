import EventCard from '@/app/components/events/event-card';
import { getPublishedEvents } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() { return getPageMetadata('Tournament calendar', 'Browse current and upcoming chess tournaments.', '/events'); }

export default async function EventsPage() {
  const events = await getPublishedEvents();
  return <main className="mx-auto max-w-304 px-5 pt-12 pb-28" id="main-content"><section className="max-w-172 py-12 pb-18"><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">Tournament calendar</p><h1 className="mb-6 text-[clamp(3.5rem,9vw,7rem)] leading-[0.9]">Make the next move.</h1><p className="max-w-152 text-[1.15rem] text-muted">Plan your next over-the-board or online event.</p></section>{events.length ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{events.map((event) => <EventCard event={event} key={event.sys.id} />)}</div> : <p className="text-muted">No tournaments are currently published.</p>}</main>;
}
