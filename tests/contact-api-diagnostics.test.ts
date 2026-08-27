import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('contact API emits non-sensitive diagnostics for its two 503 branches', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'app/api/contact/route.ts'), 'utf8');

  assert.match(source, /\[contact\] form unavailable/);
  assert.match(source, /\[contact\] email configuration unavailable/);
  assert.match(source, /resendApiKeyConfigured/);
  assert.match(source, /contentfulAccessTokenConfigured/);
  assert.doesNotMatch(source, /console\.(?:error|warn|log)\([^\n]*(?:RESEND_API_KEY|CONTENTFUL_ACCESS_TOKEN)/);
});
