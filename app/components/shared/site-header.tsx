'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import type { NavigationGroup } from '@/app/lib/navigation';

type SiteHeaderProps = { siteName: string; groups: NavigationGroup[] };

export default function SiteHeader({ siteName, groups }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const closeNavigation = () => {
    setIsOpen(false);
    setOpenGroup(null);
  };

  const isActive = (href?: string) => Boolean(href && (href === '/' ? pathname === '/' : href !== '/#album' && pathname.startsWith(href)));

  return <header className="sticky top-0 z-30 flex min-h-[4.75rem] items-center justify-between border-b border-rule/70 bg-paper/92 px-5 backdrop-blur-[14px] md:min-h-[5.25rem] md:px-[max(1.25rem,calc((100vw-76rem)/2))]">
    <Link className="h-16 w-48 overflow-hidden shrink-0 no-underline" href="/" onClick={closeNavigation}><img alt={siteName} className="w-48 max-w-none -translate-y-7 mix-blend-multiply" src="/logo.png" /></Link>
    <button className="size-11 cursor-pointer border-0 bg-transparent p-2 md:hidden" type="button" aria-expanded={isOpen} aria-controls="primary-navigation" onClick={() => { setIsOpen((open) => !open); setOpenGroup(null); }}>
      <span className="sr-only">{isOpen ? 'Close navigation' : 'Open navigation'}</span>
      <span aria-hidden="true" className="mx-auto my-[0.35rem] block h-0.5 w-6 bg-ink" />
      <span aria-hidden="true" className="mx-auto my-[0.35rem] block h-0.5 w-6 bg-ink" />
    </button>
    <nav className={`${isOpen ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col items-stretch gap-1 border-b border-rule bg-paper-raised px-5 py-4 pb-6 shadow-editorial md:static md:flex md:flex-row md:items-center md:gap-[clamp(0.25rem,1.25vw,1rem)] md:border-0 md:bg-transparent md:p-0 md:shadow-none`} id="primary-navigation" aria-label="Primary navigation">
      {groups.map((group) => group.items.length ? <div className="relative" key={group.label} onMouseEnter={() => setOpenGroup(group.label)} onMouseLeave={() => setOpenGroup(null)}>
        <button aria-expanded={openGroup === group.label} aria-haspopup="menu" className={`group inline-flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent py-3 text-left text-sm font-bold leading-tight text-ink transition-colors duration-200 hover:text-oxblood md:w-auto md:px-1 md:after:absolute md:after:inset-x-1 md:after:bottom-1 md:after:h-px md:after:origin-left md:after:bg-brass md:after:transition-transform md:after:duration-200 ${group.items.some((item) => isActive(item.href)) ? 'text-oxblood md:after:scale-x-100' : 'md:after:scale-x-0 md:hover:after:scale-x-100'}`} onClick={() => setOpenGroup((open) => open === group.label ? null : group.label)} onFocus={() => setOpenGroup(group.label)} onKeyDown={(event) => { if (event.key === 'Escape') setOpenGroup(null); }} type="button">{group.label}<span aria-hidden="true" className={`grid size-4 place-items-center transition-transform duration-200 ${openGroup === group.label ? 'rotate-180' : ''}`}><span className="block size-1.5 rotate-45 border-r border-b border-current" /></span></button>
        <div className={`${openGroup === group.label ? 'grid opacity-100 translate-y-0 pointer-events-auto' : 'hidden opacity-0 -translate-y-1 pointer-events-none'} gap-1 border-l border-rule py-2 pl-4 transition-[opacity,transform] duration-200 ease-editorial md:absolute md:left-0 md:top-full md:z-40 md:grid md:min-w-56 md:origin-top-left md:border-l-0 md:border-t-2 md:border-brass md:bg-paper-raised md:p-4 md:shadow-editorial`} role="menu">
          <p className="mb-1 font-display text-lg leading-none text-ink md:block">{group.label}</p>
          {group.items.map((item) => <Link aria-current={isActive(item.href) ? 'page' : undefined} className={`inline-flex min-h-10 items-center border-l-2 px-3 text-sm font-bold no-underline transition-colors duration-200 hover:border-brass hover:bg-paper hover:text-oxblood ${isActive(item.href) ? 'border-oxblood bg-paper text-oxblood' : 'border-transparent text-ink'}`} href={item.href} key={item.href} onClick={closeNavigation} role="menuitem">{item.label}</Link>)}
        </div>
      </div> : group.href ? <Link aria-current={isActive(group.href) ? 'page' : undefined} className={`inline-flex min-h-11 items-center py-3 text-sm font-bold leading-tight no-underline transition-colors hover:text-oxblood md:px-1 ${isActive(group.href) ? 'text-oxblood' : 'text-ink'}`} href={group.href} key={group.label} onClick={closeNavigation}>{group.label}</Link> : null)}
    </nav>
  </header>;
}
