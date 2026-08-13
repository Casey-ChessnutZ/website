import type { ReactNode } from 'react';

import SiteHeader from '@/app/components/shared/site-header';
import { getSiteSettings } from '@/app/lib/contentful/queries';
import { getPrimaryNavigation } from '@/app/lib/navigation';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  const siteName = settings.siteName ?? 'Chess Tournament Listing';

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader siteName={siteName} items={getPrimaryNavigation(settings.navigationConfig?.items)} />
      {children}
      <footer className="site-footer">
        <p>{settings.footerText ?? `© ${new Date().getFullYear()} ${siteName}`}</p>
      </footer>
    </div>
  );
}
