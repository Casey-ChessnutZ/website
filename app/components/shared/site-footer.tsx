import Link from 'next/link';

import type { NavigationGroup } from '@/app/lib/navigation';

type SiteFooterProps = { siteName: string; footerText?: string; groups: NavigationGroup[] };

export default function SiteFooter({ siteName, footerText, groups }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return <footer className="mt-20 bg-ink text-paper"><div className="mx-auto grid max-w-304 gap-12 px-5 py-16 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,.6fr))]"><div><Link className="block w-fit no-underline" href="/"><img alt={siteName} className="-my-16 w-64 invert mix-blend-screen sm:w-72" src="/logo.png" /></Link><p className="mt-5 max-w-104 text-lg text-paper/75">Find your next move. Clear information for every tournament, from first round to final board.</p></div>{groups.map((group) => <div key={group.label}><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-brass">{group.label}</h2><nav className="grid gap-2" aria-label={`Footer ${group.label}`}>{group.href ? <Link className="inline-flex min-h-11 items-center text-paper/80 no-underline transition-colors duration-200 hover:text-brass" href={group.href}>{group.label}</Link> : null}{group.items.map((item) => <Link key={`${group.label}-${item.href}-${item.label}`} className="inline-flex min-h-11 items-center text-paper/80 no-underline transition-colors duration-200 hover:text-brass" href={item.href}>{item.label}</Link>)}</nav></div>)}</div><div className="mx-auto flex max-w-304 flex-col gap-3 border-t border-paper/20 px-5 py-6 text-sm text-paper/60 md:flex-row md:items-center md:justify-between"><p className="m-0">© {year} {siteName}</p><p className="m-0">{footerText ?? 'Built for the board.'}</p></div></footer>;
}
