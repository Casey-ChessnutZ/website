import type { Metadata } from 'next';
import Link from 'next/link';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import EventHero from '@/app/components/events/event-hero';
import EventDesk from '@/app/components/events/event-desk';
import EventDocuments from '@/app/components/events/event-documents';
import EventDivisions from '@/app/components/events/event-divisions';
import EventOfficials from '@/app/components/events/event-officials';
import EventOverview from '@/app/components/events/event-overview';
import EventPairings from '@/app/components/events/event-pairings';
import EventRegistration from '@/app/components/events/event-registration';
import EventRelatedEvents from '@/app/components/events/event-related-events';
import EventScheduleTimeline from '@/app/components/events/event-schedule-timeline';
import EventVenue from '@/app/components/events/event-venue';
import { getPublishedEventBySlug } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

type EventPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const event = await getPublishedEventBySlug(slug, preview);
  return getPageMetadata(event?.title ?? 'Tournament', event?.summary, `/events/${slug}`);
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const event = await getPublishedEventBySlug(slug, preview);
  if (!event) notFound();
  const links = [['Overview', '#overview'], ['Schedule', '#schedule'], ['Venue', '#venue'], ['Officials', '#officials'], ['Divisions', '#divisions'], ['Related', '#related-events'], ['Documents', '#documents']].filter(([, href]) => (href !== '#officials' || event.officials?.length) && (href !== '#divisions' || event.divisions?.length) && (href !== '#related-events' || event.relatedEvents?.length) && (href !== '#documents' || event.documents?.length));
  return <main className="mx-auto max-w-304 px-5 pt-8 pb-28" id="main-content"><Link className="inline-flex min-h-11 items-center text-sm font-bold text-oxblood no-underline" href="/events">← All tournaments</Link><EventHero event={event} /><nav aria-label="Event sections" className="sticky top-[4.75rem] z-20 -mx-5 mt-8 flex gap-1 overflow-x-auto border-y border-rule bg-paper/95 px-5 py-2 backdrop-blur md:top-[5.25rem]">{links.map(([label, href]) => <a className="inline-flex min-h-10 shrink-0 items-center px-3 text-sm font-bold text-ink no-underline transition-colors hover:text-oxblood" href={href} key={href}>{label}</a>)}</nav><div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"><div className="space-y-12"><div id="overview"><EventOverview event={event} /></div><EventScheduleTimeline event={event} /><EventVenue event={event} /><EventOfficials event={event} /><div id="divisions"><EventDivisions event={event} /></div><EventRelatedEvents event={event} /><EventDocuments event={event} /><EventPairings event={event} /><EventRegistration event={event} /></div><EventDesk event={event} /></div></main>;
}
