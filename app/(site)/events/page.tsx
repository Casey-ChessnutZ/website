import EventCard from '@/app/components/events/event-card';
import { filterEventsByCalendarYear, getCurrentMelbourneYear, getEventCalendarYears } from '@/app/components/events/event-calendar-data';
import Link from 'next/link';
import { draftMode } from 'next/headers';
import { getPublishedEvents } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() { return getPageMetadata('Tournament calendar', 'Browse current and upcoming chess tournaments.', '/events'); }

type EventsPageProps = { searchParams: Promise<{ year?: string | string[] }> };

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { isEnabled: preview } = await draftMode();
  const events = await getPublishedEvents(1000, preview);
  const currentYear = getCurrentMelbourneYear();
  const availableYears = getEventCalendarYears(events);
  const requestedYear = (await searchParams).year;
  const selectedYear = typeof requestedYear === 'string' && availableYears.includes(Number(requestedYear)) ? Number(requestedYear) : currentYear;
  const selectedEvents = filterEventsByCalendarYear(events, selectedYear);
  return <main className="mx-auto max-w-304 px-5 pt-12 pb-28" id="main-content"><section className="max-w-172 py-12 pb-18"><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">Tournament calendar</p><h1 className="mb-6 text-[clamp(3.5rem,9vw,7rem)] leading-[0.9]">Make the next move.</h1><p className="max-w-152 text-[1.15rem] text-muted">Plan your next over-the-board or online event.</p></section>{availableYears.length ? <nav aria-label="Tournament years" className="mb-8 flex flex-wrap gap-2 border-y border-rule py-4">{availableYears.map((year) => <Link aria-current={year === selectedYear ? 'page' : undefined} className={`inline-flex min-h-11 items-center border px-4 text-sm font-bold no-underline transition-colors duration-200 ${year === selectedYear ? 'border-oxblood bg-oxblood text-paper' : 'border-rule text-ink hover:border-brass hover:text-oxblood'}`} href={year === currentYear ? '/events' : `/events?year=${year}`} key={year}>{year === currentYear ? `${year} · Current` : year}</Link>)}</nav> : null}{selectedEvents.length ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{selectedEvents.map((event) => <EventCard event={event} key={event.sys.id} />)}</div> : <div className="border border-dashed border-rule bg-paper-raised p-8" role="status"><h2 className="text-3xl">No tournaments listed for {selectedYear}.</h2><p className="mt-3 text-muted">Choose another year to browse the tournament archive.</p></div>}</main>;
}
