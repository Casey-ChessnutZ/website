import { createHmac, timingSafeEqual } from 'node:crypto';

export type ContentfulWebhookRequest = {
  method: string;
  path: string;
  headers: Headers;
  body: string;
};

const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1_000;

function canonicalHeaders(headers: Headers, signedHeaderNames: string): string | null {
  const names = signedHeaderNames.split(',').map((name) => name.trim().toLowerCase()).filter(Boolean);

  if (!names.length || new Set(names).size !== names.length) return null;

  const values = names.map((name) => {
    const value = headers.get(name);
    return value === null ? null : `${name}:${value}`;
  });

  return values.some((value) => value === null) ? null : values.join(';');
}

export function verifyContentfulWebhook(
  request: ContentfulWebhookRequest,
  signingSecret: string,
  now = Date.now(),
): boolean {
  const signature = request.headers.get('x-contentful-signature');
  const timestampValue = request.headers.get('x-contentful-timestamp');
  const signedHeaderNames = request.headers.get('x-contentful-signed-headers');
  const timestamp = Number(timestampValue);

  if (!signature || !signedHeaderNames || !Number.isFinite(timestamp)) return false;
  if (timestamp > now || now - timestamp > MAX_WEBHOOK_AGE_MS) return false;

  const headers = canonicalHeaders(request.headers, signedHeaderNames);
  if (!headers) return false;

  const canonicalRequest = [request.method, request.path, headers, request.body].join('\n');
  const expected = createHmac('sha256', signingSecret).update(canonicalRequest).digest('hex');
  const received = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');

  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}
