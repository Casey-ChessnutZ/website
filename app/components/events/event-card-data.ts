export type EventCardDate = {
  day: string;
  month: string;
  label: string;
};

export function getEventCardDate(value?: string): EventCardDate | null {
  if (!value || Number.isNaN(Date.parse(value))) return null;

  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    day: '2-digit',
    month: 'short',
  }).formatToParts(date);
  const day = parts.find((part) => part.type === 'day')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const label = new Intl.DateTimeFormat('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Melbourne',
  }).format(date);

  return day && month && label ? { day, month: month.toUpperCase(), label } : null;
}
