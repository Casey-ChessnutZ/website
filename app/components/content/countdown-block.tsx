import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function CountdownBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; targetDate?: string };
  if (!fields.targetDate) return null;
  const date = new Date(fields.targetDate);
  return <section className="content-section countdown"><p>Next key date</p><h2>{fields.headline ?? 'Tournament begins'}</h2><time dateTime={fields.targetDate}>{Number.isNaN(date.valueOf()) ? fields.targetDate : date.toLocaleDateString('en-AU', { dateStyle: 'full' })}</time></section>;
}
