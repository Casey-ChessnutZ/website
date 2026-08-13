import type { Metadata } from 'next';

import TeamDirectoryCard from '@/app/components/team/team-directory-card';
import { getPublishedPeople } from '@/app/lib/contentful/queries';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(
    'Our Team',
    'Meet the organisers and officials behind ChessNutZ tournaments.',
    '/team',
  );
}

export default async function TeamPage() {
  const people = await getPublishedPeople();

  return (
    <main id="main-content">
      <section className="relative overflow-hidden bg-oxblood px-5 py-18 text-paper sm:py-24">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgb(188_139_69_/_0.32),transparent_28rem)]" />
        <div className="relative mx-auto max-w-224">
          <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-brass">The people behind the board</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <h1 className="max-w-160 text-[clamp(4rem,10vw,8.5rem)] leading-[0.82] text-paper">Our Team</h1>
            <p className="m-0 max-w-112 border-l border-brass/70 pl-5 text-lg leading-8 text-paper/85">Tournament days are made by a committed group of organisers, arbiters, and chess people who care about every player’s experience.</p>
          </div>
          <div className="mt-12 h-px w-full bg-brass/70" />
        </div>
      </section>

      <section aria-labelledby="team-roster-heading" className="mx-auto max-w-224 px-5 py-16 sm:py-24">
        <div className="flex flex-col justify-between gap-6 border-b border-rule pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-brass">Tournament roster</p>
            <h2 className="mt-3 text-[clamp(2.7rem,6vw,5rem)] leading-[0.9]" id="team-roster-heading">Meet the team</h2>
          </div>
          <p className="m-0 max-w-112 text-muted">{people.length ? `${people.length} people dedicated to better tournament experiences.` : 'Profiles are being prepared for the next tournament season.'}</p>
        </div>

        {people.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {people.map((person) => <TeamDirectoryCard key={person.sys.id} person={person} />)}
          </div>
        ) : (
          <div className="mt-8 border border-dashed border-rule bg-paper-raised p-8 sm:p-12" role="status">
            <h3 className="text-3xl">Profiles are on their way.</h3>
            <p className="mt-3 max-w-112 text-muted">Please check back soon to meet the people supporting our tournaments.</p>
          </div>
        )}
      </section>
    </main>
  );
}
