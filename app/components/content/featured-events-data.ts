export type FeaturedEvent = {
  sys?: { id?: string };
  slug?: string;
  title?: string;
  summary?: string;
  eventDate?: string;
  format?: string;
  locationName?: string;
  fields?: {
    slug?: string;
    title?: string;
    summary?: string;
    eventDate?: string;
    format?: string;
    locationName?: string;
  };
};

export function getFeaturedEventIndex<T>(events: T[]): { lead?: T; remaining: T[] } {
  return { lead: events[0], remaining: events.slice(1) };
}

export function eventValue(event: FeaturedEvent, key: 'slug' | 'title' | 'summary' | 'eventDate' | 'format' | 'locationName') {
  return event[key] ?? event.fields?.[key];
}
