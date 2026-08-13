module.exports.up = async function ({ client, space, env }) {
  // Create a sample event entry for testing. Requires the 'event' content type to exist.
  try {
    const ct = await env.getContentType('event');
    if (!ct) {
      console.log('Event content type not found; run the first migration to create it.');
      return;
    }
  } catch (err) {
    console.log('Event content type not available yet.');
    return;
  }

  const data = {
    fields: {
      title: { 'en-US': 'Sample Chess Tournament' },
      slug: { 'en-US': 'sample-chess-tournament' },
      summary: { 'en-US': 'A sample tournament created for local testing.' },
      description: { 'en-US': 'This is a demo event created by an automated migration.' },
      eventDate: { 'en-US': new Date().toISOString() },
      locationName: { 'en-US': 'Local Chess Club' },
      status: { 'en-US': 'published' }
    }
  };

  const created = await env.createEntry('event', data);
  await created.publish();
  console.log('Created and published sample event entry:', created.sys.id);
};
