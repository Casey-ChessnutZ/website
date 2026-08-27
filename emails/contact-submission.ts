import { Body, Container, Head, Heading, Html, Text } from '@react-email/components';
import { createElement } from 'react';

import type { ContactFormDefinition } from '@/app/lib/contentful/types';

export function ContactSubmissionEmail({ form, values }: { form: ContactFormDefinition; values: Record<string, string> }) {
  return createElement(Html, null,
    createElement(Head),
    createElement(Body, { style: { backgroundColor: '#f3eee5', color: '#17120f', fontFamily: 'Arial, sans-serif' } },
      createElement(Container, { style: { margin: '0 auto', maxWidth: '600px', padding: '32px' } },
        createElement(Heading, null, `New ${form.title} submission`),
        ...form.fields.map((field) => createElement(Text, { key: field.id }, `${field.label}: ${values[field.id] || '—'}`)),
      ),
    ),
  );
}
