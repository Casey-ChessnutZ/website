module.exports.up = async function ({ client, space, env }) {
  const id = 'event';

  try {
    const existing = await env.getContentType(id).catch(() => null);
    if (existing && existing.sys) {
      console.log('Content type "event" already exists, skipping creation.');
      return;
    }
  } catch (err) {
    // continue to create
  }

  const definition = {
    name: 'Event',
    displayField: 'title',
    fields: [
      { id: 'title', name: 'Title', type: 'Symbol', required: true },
      { id: 'slug', name: 'Slug', type: 'Symbol', required: true },
      { id: 'summary', name: 'Summary', type: 'Text' },
      { id: 'description', name: 'Description', type: 'RichText' },
      { id: 'eventDate', name: 'Event Date', type: 'Date' },
      { id: 'locationName', name: 'Location Name', type: 'Symbol' },
      { id: 'locationDetails', name: 'Location Details', type: 'Text' },
      { id: 'status', name: 'Status', type: 'Symbol' },
      { id: 'heroMedia', name: 'Hero Media', type: 'Link', linkType: 'Asset' },
      { id: 'registrationUrl', name: 'Registration URL', type: 'Symbol' }
    ],
  };

  const created = await env.createContentTypeWithId(id, definition);
  await created.publish();
  console.log('Created and published content type: event');
};
