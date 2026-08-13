import { revalidatePath, revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';

import { createContentfulRevalidationPlan } from '@/app/lib/contentful/cache-revalidation';
import { verifyContentfulWebhook } from '@/app/lib/contentful/webhook-verification';

const allowedTopics = new Set([
  'ContentManagement.Entry.publish',
  'ContentManagement.Entry.unpublish',
  'ContentManagement.Entry.delete',
]);

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const signingSecret = process.env.CONTENTFUL_WEBHOOK_SIGNING_SECRET;

  if (!signingSecret) {
    return Response.json({ revalidated: false, message: 'Webhook verification is not configured.' }, { status: 503 });
  }

  const rawBody = await request.text();
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const isValid = verifyContentfulWebhook({ method: request.method, path, headers: request.headers, body: rawBody }, signingSecret);

  if (!isValid) {
    return Response.json({ revalidated: false, message: 'Unauthorized.' }, { status: 401 });
  }

  if (!allowedTopics.has(request.headers.get('x-contentful-topic') ?? '')) {
    return Response.json({ revalidated: false, message: 'Webhook topic is not supported.' }, { status: 202 });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ revalidated: false, message: 'Invalid JSON payload.' }, { status: 400 });
  }

  const plan = createContentfulRevalidationPlan(payload as Parameters<typeof createContentfulRevalidationPlan>[0]);

  if (!plan) {
    return Response.json({ revalidated: false, message: 'Content type is not supported.' }, { status: 202 });
  }

  plan.tags.forEach((tag) => revalidateTag(tag));
  plan.paths.forEach(({ path: routePath, type }) => revalidatePath(routePath, type));

  return Response.json({ revalidated: true, tags: plan.tags, paths: plan.paths.map(({ path: routePath }) => routePath) });
}
