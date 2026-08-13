export function mergeSectionBlockFields(fields: Record<string, unknown>): Record<string, unknown> {
  const content = fields.content;
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return fields;
  }

  const { content: _content, ...baseFields } = fields;
  return { ...baseFields, ...content };
}

export function richTextToPlainText(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return undefined;

  const text: string[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    const current = node as { value?: unknown; content?: unknown };
    if (typeof current.value === 'string') text.push(current.value);
    if (Array.isArray(current.content)) current.content.forEach(visit);
  };

  visit(value);
  return text.length ? text.join(' ').replace(/\s+/g, ' ').trim() : undefined;
}

export function normalizeScheduleItems(value: unknown): Array<{ time: string; title: string; detail?: string }> {
  const items = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)
      ? (value as { items: unknown[] }).items
      : [];

  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const { time, title, detail } = item as Record<string, unknown>;
    if (typeof time !== 'string' || !time.trim() || typeof title !== 'string' || !title.trim()) return [];
    return [{ time: time.trim(), title: title.trim(), ...(typeof detail === 'string' && detail.trim() ? { detail: detail.trim() } : {}) }];
  });
}

export function normalizeLocation(value: unknown): { lat: number; lon: number } | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const { lat, lon } = value as Record<string, unknown>;
  return typeof lat === 'number' && Number.isFinite(lat) && typeof lon === 'number' && Number.isFinite(lon)
    ? { lat, lon }
    : undefined;
}

export function toRichTextDocument(value: unknown) {
  if (!value || typeof value !== 'object') return undefined;
  const document = value as { nodeType?: unknown; content?: unknown };
  return document.nodeType === 'document' && Array.isArray(document.content) ? value : undefined;
}

type LinkedEventReference = { sys: { id: string } };

type LinkedEventEntry = {
  sys: { id: string };
  fields: Record<string, unknown>;
};

export function resolveEventDivisions(
  references: LinkedEventReference[] | undefined,
  entries: LinkedEventEntry[] = [],
) {
  const lookup = new Map(entries.map((entry) => [entry.sys.id, entry]));

  return (references ?? [])
    .map((reference) => lookup.get(reference.sys.id))
    .filter((entry): entry is LinkedEventEntry => Boolean(entry))
    .map((entry) => ({
      sys: { id: entry.sys.id },
      title: typeof entry.fields.title === 'string' ? entry.fields.title : 'Division',
      slug: typeof entry.fields.slug === 'string' ? entry.fields.slug : '',
      summary: typeof entry.fields.summary === 'string' ? entry.fields.summary : undefined,
      eventDate: typeof entry.fields.eventDate === 'string' ? entry.fields.eventDate : undefined,
      status: typeof entry.fields.status === 'string' ? entry.fields.status : undefined,
      format: typeof entry.fields.format === 'string' ? entry.fields.format : undefined,
      pairingUrl: typeof entry.fields.pairingUrl === 'string' ? entry.fields.pairingUrl : undefined,
    }))
    .filter((entry) => Boolean(entry.slug));
}
