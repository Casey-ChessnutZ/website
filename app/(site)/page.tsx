import Link from 'next/link';
import Image from 'next/image';

import RenderBlocks from '@/app/components/content/render-blocks';
import { getPublishedEvents, getPublishedLandingPage } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() {
  const page = await getPublishedLandingPage();
  return getPageMetadata(page?.heroHeadline ?? page?.title ?? 'Chess tournaments', page?.heroDescription, '/');
}

export default async function HomePage() {
  const page = await getPublishedLandingPage();
  const featuredEvents = page?.featuredEvents?.filter((event) => event.slug) ?? await getPublishedEvents(3);

  return <main className="homepage-main" id="main-content">
    <section className="homepage-hero" aria-labelledby="home-title">
      <Image className="hero-image" src="/images/chess-tournament-hero.png" alt="Tournament chess pieces arranged on a walnut board" fill priority sizes="100vw" />
      <div className="hero-scrim" />
      <div className="hero-grid">
        <div className="hero-copy hero-reveal">
          <p className="hero-kicker">The tournament journal</p>
          <h1 id="home-title">{page?.heroHeadline ?? page?.title ?? 'Find your next tournament'}</h1>
          <p className="hero-lede">{page?.heroDescription ?? 'Discover upcoming chess tournaments, formats, and registration details.'}</p>
          <div className="hero-actions"><Link className="button button-primary" href="/events">Explore tournaments <span aria-hidden="true">→</span></Link><a className="button button-quiet" href="#featured">View the calendar</a></div>
        </div>
        <aside className="hero-note hero-reveal" aria-label="About the tournament calendar"><span>For players</span><p>Every event, one considered place.</p></aside>
      </div>
    </section>
    {page?.sections?.length ? <RenderBlocks sections={page.sections} /> : null}
    <section className="featured-events-section" id="featured" aria-labelledby="featured-title">
      <div className="section-intro"><p className="section-kicker">On the board</p><h2 id="featured-title">Featured tournaments</h2><p>Dates, formats and the details you need to make your next move.</p></div>
      {featuredEvents.length ? <div className="featured-event-list">{featuredEvents.map((event, index) => <Link className="featured-event" key={event.sys.id} href={`/events/${event.slug}`}><span className="event-index">{String(index + 1).padStart(2, '0')}</span><div><p className="event-date">{event.eventDate ?? 'Date to be announced'}</p><h3>{event.title}</h3><p>{event.summary ?? 'View tournament details and registration information.'}</p></div><span className="event-arrow" aria-hidden="true">↗</span></Link>)}</div> : <p className="empty-state">There are no published tournaments to show yet.</p>}
      <Link className="text-link" href="/events">See all tournaments <span aria-hidden="true">→</span></Link>
    </section>
    <section className="about-strip" id="about"><p>From first move to final round.</p><span>Content updated by the people who run the events.</span></section>
  </main>;
}
