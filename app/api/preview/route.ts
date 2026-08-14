import { timingSafeEqual } from 'node:crypto';

import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { getPreviewRedirectPath, isSafePreviewPath } from '@/app/lib/contentful/preview';

function isValidPreviewSecret(secret: string | null): boolean {
  const expected = process.env.CONTENTFUL_PREVIEW_SECRET;
  if (!secret || !expected || secret.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(secret), Buffer.from(expected));
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (!isValidPreviewSecret(url.searchParams.get('secret'))) {
    return Response.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const requestedPath = url.searchParams.get('path');
  if (requestedPath && !isSafePreviewPath(requestedPath)) {
    return Response.json({ message: 'Invalid preview path.' }, { status: 400 });
  }

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(getPreviewRedirectPath(requestedPath), request.url));
}
