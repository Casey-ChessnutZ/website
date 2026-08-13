'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import type { PrimaryNavigationItem } from '@/app/lib/navigation';

type SiteHeaderProps = { siteName: string; items: PrimaryNavigationItem[] };

export default function SiteHeader({ siteName, items }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return <header className="site-header">
    <Link className="site-brand" href="/" onClick={() => setIsOpen(false)}>{siteName}</Link>
    <button className="nav-toggle" type="button" aria-expanded={isOpen} aria-controls="primary-navigation" onClick={() => setIsOpen((open) => !open)}>
      <span className="sr-only">{isOpen ? 'Close navigation' : 'Open navigation'}</span>
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </button>
    <nav className={isOpen ? 'site-nav is-open' : 'site-nav'} id="primary-navigation" aria-label="Primary navigation">
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : item.href !== '/#about' && pathname.startsWith(item.href);
        return <Link aria-current={active ? 'page' : undefined} className={item.style === 'primary' ? 'nav-cta' : 'nav-link'} href={item.href} key={`${item.label}-${item.href}`} onClick={() => setIsOpen(false)}>{item.label}</Link>;
      })}
    </nav>
  </header>;
}
