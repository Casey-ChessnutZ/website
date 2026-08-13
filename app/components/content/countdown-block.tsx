import type { LandingPageBlock } from '@/app/lib/contentful/types';
import { formatEventDate } from '@/app/lib/formatting/date';

export default function CountdownBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; targetDate?: string };
  if (!fields.targetDate) return null;
  const dateLabel = formatEventDate(fields.targetDate);
  return <section className="mx-auto mt-28 grid max-w-304 grid-cols-1 gap-8 border-y border-rule px-5 py-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"><div><p className="text-[0.8rem] font-bold uppercase tracking-[0.12em] text-muted">Next key date</p><h2 className="max-w-[13ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{fields.headline ?? 'Tournament begins'}</h2></div><time className="self-end font-display text-[clamp(1.5rem,3vw,2.6rem)] leading-[1.05]" dateTime={fields.targetDate}>{dateLabel ?? 'Date to be announced'}</time></section>;
}
