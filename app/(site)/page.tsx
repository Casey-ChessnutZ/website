import Link from 'next/link';
import Image from 'next/image';

import RenderBlocks from '@/app/components/content/render-blocks';
import { formatEventDate } from '@/app/lib/formatting/date';
import { getPublishedEvents, getPublishedLandingPage } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() {
  const page = await getPublishedLandingPage();
  return getPageMetadata(page?.heroHeadline ?? page?.title ?? 'Chess tournaments', page?.heroDescription, '/');
}

export default async function HomePage() {
  const page = await getPublishedLandingPage();
  const featuredEvents = page?.featuredEvents?.filter((event) => event.slug) ?? await getPublishedEvents(3);

  return <main className="overflow-hidden" id="main-content">
    <section className="relative isolate grid min-h-[min(40rem,calc(100dvh-4.75rem))] text-paper md:min-h-[min(48rem,calc(100dvh-5.25rem))]" aria-labelledby="home-title">
      <Image className="-z-20 object-cover object-[65%_center]" src="/images/chess-tournament-hero.png" alt="Tournament chess pieces arranged on a walnut board" fill priority sizes="100vw" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(16_12_10_/_0.92),rgb(22_14_13_/_0.48))] md:bg-[linear-gradient(90deg,rgb(16_12_10_/_0.94)_0%,rgb(22_14_13_/_0.74)_45%,rgb(22_14_13_/_0.15)_100%)]" />
      <div className="mx-auto grid w-full max-w-304 grid-cols-1 items-end gap-8 px-5 pt-24 pb-10 md:grid-cols-[minmax(0,1fr)_minmax(10rem,18rem)] md:px-5 md:pt-[clamp(7rem,15vw,12rem)] md:pb-12">
        <div className="max-w-184 animate-rise-in motion-reduce:animate-none">
          <p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">The tournament journal</p>
          <h1 className="mb-6 max-w-[10ch] text-[clamp(3rem,17vw,4.4rem)] leading-[0.91] md:text-[clamp(3.4rem,9vw,7.8rem)]" id="home-title">{page?.heroHeadline ?? page?.title ?? 'Find your next tournament'}</h1>
          <p className="max-w-148 text-[clamp(1.08rem,2vw,1.3rem)]">{page?.heroDescription ?? 'Discover upcoming chess tournaments, formats, and registration details.'}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row"><Link className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 bg-oxblood px-[1.1rem] py-[0.78rem] text-sm font-bold leading-tight text-paper no-underline transition duration-200 ease-editorial hover:-translate-y-px hover:bg-oxblood-dark" href="/events">Explore tournaments <span aria-hidden="true">→</span></Link><a className="inline-flex min-h-11 cursor-pointer items-center justify-center border border-paper/65 px-[1.1rem] py-[0.78rem] text-sm font-bold leading-tight text-paper no-underline transition duration-200 ease-editorial hover:bg-paper hover:text-ink" href="#featured">View the calendar</a></div>
        </div>
        <aside className="hidden animate-rise-in border-l border-paper/45 pl-4 [animation-delay:100ms] motion-reduce:animate-none md:block" aria-label="About the tournament calendar"><span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-brass">For players</span><p className="mt-2 font-display text-[1.35rem] leading-[1.16]">Every event, one considered place.</p></aside>
      </div>
    </section>
    {page?.sections?.length ? <RenderBlocks sections={page.sections} /> : null}
    <section className="mx-auto mt-28 grid max-w-304 gap-12 px-5 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:gap-12" id="featured" aria-labelledby="featured-title">
      <div className="min-w-0"><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">On the board</p><h2 className="max-w-[13ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]" id="featured-title">Featured tournaments</h2><p className="max-w-168 text-muted">Dates, formats and the details you need to make your next move.</p></div>
      {featuredEvents.length ? <div className="border-t border-ink">{featuredEvents.map((event, index) => <Link className="group grid grid-cols-[2.2rem_minmax(0,1fr)_2rem] items-start gap-4 border-b border-rule py-6 no-underline transition-colors duration-200 ease-editorial hover:text-oxblood" key={event.sys.id} href={`/events/${event.slug}`}><span className="pt-1 text-[0.78rem] font-bold tabular-nums text-muted">{String(index + 1).padStart(2, '0')}</span><div><p className="mb-1.5 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">{formatEventDate(event.eventDate) ?? 'Date to be announced'}</p><h3 className="mb-2 text-[clamp(1.6rem,3vw,2.4rem)] leading-[0.96]">{event.title}</h3><p className="mb-0 max-w-136 text-muted">{event.summary ?? 'View tournament details and registration information.'}</p></div><span className="justify-self-end text-2xl transition-transform duration-200 ease-editorial group-hover:translate-x-1" aria-hidden="true">↗</span></Link>)}</div> : <p className="text-muted">There are no published tournaments to show yet.</p>}
      <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-oxblood no-underline" href="/events">See all tournaments <span aria-hidden="true">→</span></Link>
    </section>
    <section className="mx-auto mt-28 flex max-w-304 flex-col items-start justify-between gap-6 border-t border-rule px-5 pt-6 pb-12 md:flex-row md:items-center"><p className="mb-0 font-display text-[clamp(1.5rem,3vw,2.3rem)] leading-none">From first move to final round.</p><span className="max-w-72 text-muted">Content updated by the people who run the events.</span></section>
  </main>;
}
