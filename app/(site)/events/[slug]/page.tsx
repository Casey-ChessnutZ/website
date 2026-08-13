import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import EventHero from '@/app/components/events/event-hero';
import EventLocation from '@/app/components/events/event-location';
import EventOverview from '@/app/components/events/event-overview';
import EventRegistration from '@/app/components/events/event-registration';
import EventSchedule from '@/app/components/events/event-schedule';
import { getPublishedEventBySlug } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

type EventPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  return getPageMetadata(event?.title ?? 'Tournament', event?.summary, `/events/${slug}`);
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();
  return <main className="site-main event-page" id="main-content"><Link className="back-link" href="/events">← All tournaments</Link><EventHero event={event} /><EventOverview event={event} /><EventSchedule event={event} /><EventLocation event={event} /><EventRegistration event={event} /></main>;
}
