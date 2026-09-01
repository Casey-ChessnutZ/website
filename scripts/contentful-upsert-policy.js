function isContentTypeUpdateEnabled(contentType, environment = process.env) {
  return (environment.CONTENTFUL_UPSERT_CONTENT_TYPES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .includes(contentType);
}

function isContentTypeSelected(contentType, environment = process.env) {
  const selected = (environment.CONTENTFUL_SYNC_CONTENT_TYPES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return !selected.length || selected.includes(contentType);
}

module.exports = { isContentTypeSelected, isContentTypeUpdateEnabled };
