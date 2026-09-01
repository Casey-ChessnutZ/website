import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('Contentful sync removes the retired contact fields widget', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'scripts/contentful-zero-touch.js'), 'utf8');

  assert.match(source, /configureContactFormEditor/);
  assert.match(source, /fieldId !== 'fields'/);
  assert.match(source, /fieldId: 'fieldDefinitions'/);
  assert.match(source, /widgetId: 'objectEditor'/);
});

test('Contentful sync preserves existing editor content unless its content type is enabled for updates', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'scripts/contentful-zero-touch.js'), 'utf8');

  assert.match(source, /updateExisting = isContentTypeUpdateEnabled\(contentType\)/);
  assert.match(source, /isContentTypeUpdateEnabled\('sectionBlock'\)/);
});
