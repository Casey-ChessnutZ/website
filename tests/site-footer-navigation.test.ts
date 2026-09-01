import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('site layout supplies normalized CMS navigation groups to the shared footer', () => {
  const layout = fs.readFileSync(path.join(process.cwd(), 'app/(site)/layout.tsx'), 'utf8');

  assert.match(layout, /getFooterNavigationGroups\(settings\.footerNavigationConfig\)/);
  assert.match(layout, /<SiteFooter[\s\S]*groups=\{footerNavigationGroups\}/);
});

test('footer renders each supplied navigation group instead of static links', () => {
  const footer = fs.readFileSync(path.join(process.cwd(), 'app/components/shared/site-footer.tsx'), 'utf8');

  assert.match(footer, /groups\.map\(\(group\)/);
  assert.match(footer, /group\.items\.map\(\(item\)/);
});
