import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';

import { verifyContentfulWebhook } from '../app/lib/contentful/webhook-verification.ts';

const signingSecret = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const body = '{"sys":{"id":"entry-id"}}';
const timestamp = '1735689600000';
const signedHeaders = 'content-type,x-contentful-timestamp';
const headers = new Headers({
  'content-type': 'application/vnd.contentful.management.v1+json',
  'x-contentful-signed-headers': signedHeaders,
  'x-contentful-timestamp': timestamp,
});

function signedRequest(signature: string, rawBody = body) {
  const requestHeaders = new Headers(headers);
  requestHeaders.set('x-contentful-signature', signature);
  return { method: 'POST', path: '/api/revalidate/contentful', headers: requestHeaders, body: rawBody };
}

function signatureForBody(rawBody = body) {
  const canonical = [
    'POST',
    '/api/revalidate/contentful',
    'content-type:application/vnd.contentful.management.v1+json;x-contentful-timestamp:1735689600000',
    rawBody,
  ].join('\n');
  return createHmac('sha256', signingSecret).update(canonical).digest('hex');
}

test('accepts an authentic Contentful request within the allowed timestamp window', () => {
  assert.equal(verifyContentfulWebhook(signedRequest(signatureForBody()), signingSecret, 1735689600000 + 60_000), true);
});

test('rejects a request whose body no longer matches its signature', () => {
  assert.equal(verifyContentfulWebhook(signedRequest(signatureForBody(), '{"sys":{"id":"tampered"}}'), signingSecret, 1735689600000 + 60_000), false);
});

test('rejects an otherwise valid request older than five minutes', () => {
  assert.equal(verifyContentfulWebhook(signedRequest(signatureForBody()), signingSecret, 1735689600000 + 300_001), false);
});
