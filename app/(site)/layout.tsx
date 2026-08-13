import type { ReactNode } from 'react';

import SiteHeader from '@/app/components/shared/site-header';
import SiteFooter from '@/app/components/shared/site-footer';
import { getSiteSettings } from '@/app/lib/contentful/queries';
import { getPrimaryNavigation } from '@/app/lib/navigation';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  const siteName = settings.siteName ?? 'ChessNutZ';

  return (
    <div className="min-h-dvh">
      <a className="fixed top-[-4rem] left-4 z-[100] bg-ink px-4 py-3 text-paper focus:top-4" href="#main-content">Skip to content</a>
      <SiteHeader siteName={siteName} items={getPrimaryNavigation(settings.navigationConfig?.items)} />
      {children}
      <SiteFooter siteName={siteName} footerText={settings.footerText} />
    </div>
  );
}
