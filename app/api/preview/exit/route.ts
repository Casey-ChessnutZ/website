import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { getPreviewRedirectPath } from '@/app/lib/contentful/preview';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  (await draftMode()).disable();
  return NextResponse.redirect(new URL(getPreviewRedirectPath(url.searchParams.get('path')), request.url));
}
