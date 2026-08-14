import type { ReactNode } from 'react';
import { draftMode } from 'next/headers';

import SiteHeader from '@/app/components/shared/site-header';
import SiteFooter from '@/app/components/shared/site-footer';
import { getSiteSettings } from '@/app/lib/contentful/queries';
import { getPrimaryNavigation } from '@/app/lib/navigation';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const { isEnabled: preview } = await draftMode();
  const settings = await getSiteSettings(preview);
  const siteName = settings.siteName ?? 'ChessNutZ';

  return (
    <div className="min-h-dvh">
      <a className="fixed top-[-4rem] left-4 z-[100] bg-ink px-4 py-3 text-paper focus:top-4" href="#main-content">Skip to content</a>
      {preview ? <aside aria-label="Content preview" className="bg-ink px-5 py-2 text-center text-sm text-paper"><span>Previewing draft content.</span><a className="ml-3 font-bold text-brass" href="/api/preview/exit?path=/">Exit preview</a></aside> : null}
      <SiteHeader siteName={siteName} items={getPrimaryNavigation(settings.navigationConfig?.items)} />
      {children}
      <SiteFooter siteName={siteName} footerText={settings.footerText} />
    </div>
  );
}
