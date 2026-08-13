import Link from 'next/link';
import { getPublishedEvents } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() { return getPageMetadata('Tournament calendar', 'Browse current and upcoming chess tournaments.', '/events'); }

export default async function EventsPage() {
  const events = await getPublishedEvents();
  return <main className="site-main" id="main-content"><section className="page-intro"><p className="section-kicker">Tournament calendar</p><h1>Make the next move.</h1><p className="lede">Plan your next over-the-board or online event.</p></section>{events.length ? <div className="card-grid">{events.map((event) => <Link className="card event-card" key={event.sys.id} href={`/events/${event.slug}`}><p className="event-date">{event.eventDate ?? 'Date to be announced'}</p><h2>{event.title}</h2><p>{event.summary ?? 'View tournament details.'}</p><span className="text-link">Explore event <span aria-hidden="true">→</span></span></Link>)}</div> : <p className="empty-state">No tournaments are currently published.</p>}</main>;
}
