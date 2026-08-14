import assert from 'node:assert/strict';
import test from 'node:test';

import { getContentfulConfig } from '../app/lib/contentful/client.ts';
import { getPreviewRedirectPath, isSafePreviewPath } from '../app/lib/contentful/preview.ts';

test('allows only internal public site routes as preview redirects', () => {
  assert.equal(isSafePreviewPath('/events/melbourne-open-2026'), true);
  assert.equal(isSafePreviewPath('/'), true);
  assert.equal(isSafePreviewPath('/page/privacy?edition=2026'), true);
  assert.equal(isSafePreviewPath('/api/revalidate/contentful'), false);
  assert.equal(isSafePreviewPath('//attacker.example'), false);
  assert.equal(isSafePreviewPath('https://attacker.example'), false);
  assert.equal(getPreviewRedirectPath(null), '/');
});

test('uses the Preview API and token only for an explicit preview request', () => {
  const originalEnvironment = { ...process.env };

  try {
    process.env.CONTENTFUL_OFFLINE = 'false';
    process.env.CONTENTFUL_SPACE_ID = 'space-id';
    process.env.CONTENTFUL_ENVIRONMENT = 'master';
    process.env.CONTENTFUL_ACCESS_TOKEN = 'delivery-token';
    process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN = 'preview-token';

    assert.deepEqual(getContentfulConfig(false), {
      accessToken: 'delivery-token',
      environment: 'master',
      preview: false,
      spaceId: 'space-id',
    });
    assert.deepEqual(getContentfulConfig(true), {
      accessToken: 'preview-token',
      environment: 'master',
      preview: true,
      spaceId: 'space-id',
    });
  } finally {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnvironment)) delete process.env[key];
    }
    Object.assign(process.env, originalEnvironment);
  }
});
