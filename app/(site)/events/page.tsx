import Link from 'next/link';
import { formatEventDate } from '@/app/lib/formatting/date';
import { getPublishedEvents } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() { return getPageMetadata('Tournament calendar', 'Browse current and upcoming chess tournaments.', '/events'); }

export default async function EventsPage() {
  const events = await getPublishedEvents();
  return <main className="mx-auto max-w-304 px-5 pt-12 pb-28" id="main-content"><section className="max-w-172 py-12 pb-18"><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">Tournament calendar</p><h1 className="mb-6 text-[clamp(3.5rem,9vw,7rem)] leading-[0.9]">Make the next move.</h1><p className="max-w-152 text-[1.15rem] text-muted">Plan your next over-the-board or online event.</p></section>{events.length ? <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-px border border-rule bg-rule">{events.map((event) => <Link className="min-w-0 bg-paper-raised p-6 no-underline transition duration-200 ease-editorial hover:-translate-y-0.5 hover:bg-white" key={event.sys.id} href={`/events/${event.slug}`}><p className="mb-1.5 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">{formatEventDate(event.eventDate) ?? 'Date to be announced'}</p><h2 className="text-[1.7rem] leading-[1.02]">{event.title}</h2><p>{event.summary ?? 'View tournament details.'}</p><span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-oxblood">Explore event <span aria-hidden="true">→</span></span></Link>)}</div> : <p className="text-muted">No tournaments are currently published.</p>}</main>;
}
