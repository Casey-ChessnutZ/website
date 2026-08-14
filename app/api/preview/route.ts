import { timingSafeEqual } from 'node:crypto';

import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { contentfulFetch } from '@/app/lib/contentful/client';
import { getContentfulPreviewPath, isContentfulEntryId } from '@/app/lib/contentful/preview';

type ContentfulPreviewEntry = {
  sys?: { contentType?: { sys?: { id?: string } } };
  fields?: { slug?: string };
};

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

  const entryId = url.searchParams.get('entryId');
  if (!isContentfulEntryId(entryId)) {
    return Response.json({ message: 'A valid Contentful entryId is required.' }, { status: 400 });
  }

  const entry = await contentfulFetch<ContentfulPreviewEntry>(`entries/${entryId}`, {}, [], { preview: true });
  const path = getContentfulPreviewPath(entry?.sys?.contentType?.sys?.id, entry?.fields?.slug);
  if (!path) return Response.json({ message: 'This Contentful entry does not have a preview route.' }, { status: 404 });

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(path, request.url));
}
