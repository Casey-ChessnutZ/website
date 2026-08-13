import assert from 'node:assert/strict';
import test from 'node:test';

import { contentfulFetch } from '../app/lib/contentful/client.ts';

test('returns null when the Contentful request cannot reach the API', async () => {
  const originalFetch = globalThis.fetch;
  const originalSpace = process.env.CONTENTFUL_SPACE_ID;
  const originalToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  process.env.CONTENTFUL_SPACE_ID = 'test-space';
  process.env.CONTENTFUL_ACCESS_TOKEN = 'test-token';
  globalThis.fetch = async () => Promise.reject(new Error('network unavailable'));

  try {
    const result = await contentfulFetch('entries');
    assert.equal(result, null);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSpace === undefined) delete process.env.CONTENTFUL_SPACE_ID;
    else process.env.CONTENTFUL_SPACE_ID = originalSpace;
    if (originalToken === undefined) delete process.env.CONTENTFUL_ACCESS_TOKEN;
    else process.env.CONTENTFUL_ACCESS_TOKEN = originalToken;
  }
});

test('does not call Contentful when offline mode is enabled', async () => {
  const originalFetch = globalThis.fetch;
  const originalOffline = process.env.CONTENTFUL_OFFLINE;
  const originalPreview = process.env.CONTENTFUL_PREVIEW;
  const originalSpace = process.env.CONTENTFUL_SPACE_ID;
  const originalToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  process.env.CONTENTFUL_OFFLINE = 'true';
  process.env.CONTENTFUL_PREVIEW = 'false';
  process.env.CONTENTFUL_SPACE_ID = 'test-space';
  process.env.CONTENTFUL_ACCESS_TOKEN = 'test-token';
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error('fetch must not run in offline mode');
  };

  try {
    assert.equal(await contentfulFetch('entries'), null);
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalOffline === undefined) delete process.env.CONTENTFUL_OFFLINE;
    else process.env.CONTENTFUL_OFFLINE = originalOffline;
    if (originalPreview === undefined) delete process.env.CONTENTFUL_PREVIEW;
    else process.env.CONTENTFUL_PREVIEW = originalPreview;
    if (originalSpace === undefined) delete process.env.CONTENTFUL_SPACE_ID;
    else process.env.CONTENTFUL_SPACE_ID = originalSpace;
    if (originalToken === undefined) delete process.env.CONTENTFUL_ACCESS_TOKEN;
    else process.env.CONTENTFUL_ACCESS_TOKEN = originalToken;
  }
});
