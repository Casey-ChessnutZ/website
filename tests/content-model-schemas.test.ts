import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const schemaPath = (name: string) => path.join(process.cwd(), 'content-model', 'schemas', name);
const readSchema = (name: string) => JSON.parse(fs.readFileSync(schemaPath(name), 'utf8'));

const homepageSectionContentTypes = [
  'homeHero', 'richTextSection', 'imageTextSection', 'featuredEventsSection', 'eventCountdownSection',
  'featureCardsSection', 'imageGallerySection', 'mediaEmbeded', 'timelineSection', 'quoteSection', 'ctaBannerSection',
];

test('landing page accepts only focused homepage section content types', () => {
  const landingPage = readSchema('landing-page.schema.json');
  const sections = landingPage.fields.find((field: { id: string }) => field.id === 'sections');
  assert.deepEqual(sections.items.validations[0].linkContentType, homepageSectionContentTypes);
  assert.equal(fs.existsSync(schemaPath('section-block.schema.json')), false);
});

test('event has no obsolete legacy fields', () => {
  const ids = readSchema('event.schema.json').fields.map((field: { id: string }) => field.id);
  assert.equal(ids.includes('venueLatitude'), false);
  assert.equal(ids.includes('venueLongitude'), false);
  assert.equal(ids.includes('scheduleItems'), false);
});
