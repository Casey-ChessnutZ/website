import Link from 'next/link';
import { draftMode } from 'next/headers';

import { formatEventDate } from '@/app/lib/formatting/date';
import { getPublishedNews } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() { return getPageMetadata('News', 'Tournament news, announcements, and organiser updates.', '/news'); }

export default async function NewsPage() {
  const { isEnabled: preview } = await draftMode();
  const news = await getPublishedNews(12, preview);
  return <main className="mx-auto max-w-304 px-5 pt-12 pb-28" id="main-content"><section className="max-w-172 py-12 pb-18"><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">From the organisers</p><h1 className="mb-6 text-[clamp(3.5rem,9vw,7rem)] leading-[0.9]">News from the board.</h1><p className="max-w-152 text-[1.15rem] text-muted">Announcements, tournament updates, and practical information before the first move.</p></section>{news.length ? <div className="border-t border-ink">{news.map((entry) => <Link className="group grid gap-4 border-b border-rule py-8 no-underline transition-colors duration-200 hover:text-oxblood md:grid-cols-[11rem_minmax(0,1fr)_2rem]" href={`/news/${entry.slug}`} key={entry.sys.id}><div><p className="mb-2 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">{formatEventDate(entry.publishedDate) ?? 'Latest update'}</p>{entry.tags?.length ? <p className="m-0 text-sm text-muted">{entry.tags.join(' · ')}</p> : null}</div><div><h2 className="mb-3 text-[clamp(2rem,4vw,3.2rem)] leading-none">{entry.title}</h2><p className="m-0 max-w-152 text-muted">{entry.summary ?? 'Read the latest organiser update.'}</p></div><span className="self-start justify-self-end text-2xl transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">↗</span></Link>)}</div> : <p className="text-muted">There are no published updates yet.</p>}</main>;
}
