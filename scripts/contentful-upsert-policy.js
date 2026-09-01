function isContentTypeUpdateEnabled(contentType, environment = process.env) {
  return (environment.CONTENTFUL_UPSERT_CONTENT_TYPES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .includes(contentType);
}

module.exports = { isContentTypeUpdateEnabled };
