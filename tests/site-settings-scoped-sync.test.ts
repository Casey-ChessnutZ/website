import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('provides a site-settings-only Contentful model and editor sync', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'scripts/contentful-zero-touch.js'), 'utf8');

  assert.match(source, /CONTENTFUL_SYNC_SITE_SETTINGS_ONLY/);
  assert.match(source, /ensureFooterNavigationField/);
  assert.match(source, /footerNavigationConfig/);
  assert.match(source, /configureSiteSettingsEditor/);
});
