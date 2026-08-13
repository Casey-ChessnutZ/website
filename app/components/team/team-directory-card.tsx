import Link from 'next/link';

import { getTeamMemberMeta } from './team-card-data';

import type { PersonEntry } from '@/app/lib/contentful/types';

export default function TeamDirectoryCard({ person }: { person: PersonEntry }) {
  const role = person.title ?? 'Tournament official';

  return (
    <Link
      className="group relative block min-h-11 overflow-hidden border border-rule bg-paper-raised text-ink no-underline transition-[transform,border-color,box-shadow] duration-200 ease-editorial hover:-translate-y-1 hover:border-brass hover:shadow-editorial"
      href={`/team/${person.slug}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink">
        {person.image?.url ? (
          <img
            alt={person.image.description ?? `Portrait of ${person.name}`}
            className="size-full object-cover transition-transform duration-300 ease-editorial group-hover:scale-[1.03]"
            height="480"
            loading="lazy"
            src={person.image.url}
            width="640"
          />
        ) : (
          <span aria-hidden="true" className="grid size-full place-items-center font-display text-[clamp(4rem,10vw,7rem)] leading-none text-paper">
            {person.name.slice(0, 1)}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/60 to-transparent" />
      </div>
      <div className="p-5 sm:p-6">
        <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brass">{role}</p>
        <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-[0.92]">{person.name}</h2>
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-rule pt-4">
          <p className="m-0 max-w-[18rem] text-sm leading-6 text-muted">{getTeamMemberMeta(person)}</p>
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full border border-rule text-oxblood transition-colors duration-200 group-hover:border-oxblood group-hover:bg-oxblood group-hover:text-paper">
            <svg className="size-4" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
