import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import EventCard from '@/app/components/events/event-card';
import { getPublishedEventsForPerson, getPublishedPersonBySlug } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

type TeamProfilePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: TeamProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const person = await getPublishedPersonBySlug(slug);
  return getPageMetadata(person?.name ?? 'Tournament official', person?.title, `/team/${slug}`);
}

export default async function TeamProfilePage({ params }: TeamProfilePageProps) {
  const { slug } = await params;
  const person = await getPublishedPersonBySlug(slug);
  if (!person) notFound();

  const events = await getPublishedEventsForPerson(person.sys.id);

  return <main className="mx-auto max-w-224 px-5 pt-8 pb-28" id="main-content"><Link className="inline-flex min-h-11 items-center text-sm font-bold text-oxblood no-underline" href="/team">← Our Team</Link><header className="mt-12 grid gap-8 border-b border-rule pb-12 md:grid-cols-[12rem_1fr] md:items-end">{person.image?.url ? <img alt={person.image.description ?? `Portrait of ${person.name}`} className="aspect-square w-full max-w-48 object-cover" height="384" src={person.image.url} width="384" /> : <div aria-hidden="true" className="grid aspect-square max-w-48 place-items-center bg-ink font-display text-7xl text-paper">{person.name.slice(0, 1)}</div>}<div><p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brass">{person.title ?? 'Tournament official'}</p><h1 className="mt-3 text-[clamp(3rem,7vw,6rem)] leading-[0.9]">{person.name}</h1>{person.federation || person.location ? <p className="mt-4 text-muted">{[person.federation, person.location].filter(Boolean).join(' · ')}</p> : null}</div></header><div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]"><article className="max-w-152 whitespace-pre-wrap text-lg leading-8">{person.about ?? 'Profile information will be added soon.'}</article><aside className="border border-rule bg-paper-raised p-6">{person.fideProfileUrl ? <a className="inline-flex min-h-11 items-center text-sm font-bold text-oxblood no-underline" href={person.fideProfileUrl} rel="noreferrer" target="_blank">View FIDE profile ↗</a> : <p className="m-0 text-muted">FIDE profile coming soon.</p>}</aside></div>{events.length ? <section className="mt-16"><p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brass">Tournament credits</p><h2 className="mt-3 text-[clamp(2.3rem,5vw,4rem)] leading-none">Upcoming events</h2><div className="mt-8 grid gap-5 md:grid-cols-2">{events.map((event) => <EventCard event={event} key={event.sys.id} />)}</div></section> : null}</main>;
}
