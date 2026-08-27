import assert from 'node:assert/strict';
import test from 'node:test';

import { mapContactFormItem } from '../app/lib/contact/contact-form-definition.ts';

test('maps an editor-defined select field with its options', () => {
  assert.deepEqual(
    mapContactFormItem({ fields: { title: 'Contact', intro: 'Hello', successMessage: 'Received', fields: [
      { id: 'topic', label: 'Topic', type: 'select', required: true, options: ['Event', 'Coaching'] },
    ] } }),
    { title: 'Contact', intro: 'Hello', successMessage: 'Received', fields: [
      { id: 'topic', label: 'Topic', type: 'select', required: true, options: ['Event', 'Coaching'] },
    ] },
  );
});

test('drops malformed fields and unsupported field types', () => {
  assert.deepEqual(
    mapContactFormItem({ fields: { title: 'Contact', intro: 'Hello', successMessage: 'Received', fields: [
      { id: '', label: 'Missing ID', type: 'text', required: true },
      { id: 'unsafe', label: 'Unsafe', type: 'file', required: true },
    ] } }),
    { title: 'Contact', intro: 'Hello', successMessage: 'Received', fields: [] },
  );
});
