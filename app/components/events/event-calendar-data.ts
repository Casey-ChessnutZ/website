import type { EventEntry } from '@/app/lib/contentful/types';

const melbourneTimeZone = 'Australia/Melbourne';

export function getEventCalendarYear(eventDate?: string): number | undefined {
  if (!eventDate || Number.isNaN(new Date(eventDate).getTime())) return undefined;
  const year = new Intl.DateTimeFormat('en-AU', { year: 'numeric', timeZone: melbourneTimeZone }).format(new Date(eventDate));
  return Number(year);
}

export function getEventCalendarYears(events: Array<Pick<EventEntry, 'eventDate'>>): number[] {
  return [...new Set(events.map((event) => getEventCalendarYear(event.eventDate)).filter((year): year is number => Boolean(year)))].sort((a, b) => b - a);
}

export function filterEventsByCalendarYear<T extends Pick<EventEntry, 'eventDate'>>(events: T[], year: number): T[] {
  return events.filter((event) => getEventCalendarYear(event.eventDate) === year);
}

export function getCurrentMelbourneYear(now = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-AU', { year: 'numeric', timeZone: melbourneTimeZone }).format(now));
}
