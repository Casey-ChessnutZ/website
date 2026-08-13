'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import type { PrimaryNavigationItem } from '@/app/lib/navigation';

type SiteHeaderProps = { siteName: string; items: PrimaryNavigationItem[] };

export default function SiteHeader({ siteName, items }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return <header className="sticky top-0 z-30 flex min-h-[4.75rem] items-center justify-between border-b border-rule/70 bg-paper/92 px-5 backdrop-blur-[14px] md:min-h-[5.25rem] md:px-[max(1.25rem,calc((100vw-76rem)/2))]">
    <Link className="min-w-0 font-display text-[clamp(1.2rem,2vw,1.5rem)] font-bold leading-none tracking-[-0.04em] no-underline before:mr-[0.45rem] before:inline-block before:size-[0.65em] before:rotate-45 before:bg-oxblood before:content-['']" href="/" onClick={() => setIsOpen(false)}>{siteName}</Link>
    <button className="size-11 cursor-pointer border-0 bg-transparent p-2 md:hidden" type="button" aria-expanded={isOpen} aria-controls="primary-navigation" onClick={() => setIsOpen((open) => !open)}>
      <span className="sr-only">{isOpen ? 'Close navigation' : 'Open navigation'}</span>
      <span aria-hidden="true" className="mx-auto my-[0.35rem] block h-0.5 w-6 bg-ink" />
      <span aria-hidden="true" className="mx-auto my-[0.35rem] block h-0.5 w-6 bg-ink" />
    </button>
    <nav className={`${isOpen ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col items-stretch gap-1 border-b border-rule bg-paper-raised px-5 py-4 pb-6 shadow-editorial md:static md:flex md:flex-row md:items-center md:gap-[clamp(0.7rem,2vw,1.6rem)] md:border-0 md:bg-transparent md:p-0 md:shadow-none`} id="primary-navigation" aria-label="Primary navigation">
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : item.href !== '/#about' && pathname.startsWith(item.href);
        return <Link aria-current={active ? 'page' : undefined} className={item.style === 'primary' ? 'mt-2 inline-flex min-h-12 cursor-pointer items-center justify-center bg-oxblood px-4 py-3 text-sm font-bold leading-tight text-paper no-underline transition duration-200 ease-editorial hover:-translate-y-px hover:bg-oxblood-dark md:mt-0 md:min-h-11' : `inline-flex min-h-12 cursor-pointer items-center py-3 text-sm font-bold leading-tight text-ink no-underline transition-colors duration-200 ease-editorial hover:text-oxblood md:min-h-11 md:px-px ${active ? 'text-oxblood' : ''}`} href={item.href} key={`${item.label}-${item.href}`} onClick={() => setIsOpen(false)}>{item.label}</Link>;
      })}
    </nav>
  </header>;
}
