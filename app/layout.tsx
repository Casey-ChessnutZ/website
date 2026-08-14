import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('ChessNutZ', 'Contentful-driven chess tournament website', '/');
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}<Analytics /><SpeedInsights /></body>
    </html>
  );
}
