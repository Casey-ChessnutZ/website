import Link from 'next/link';
import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function CtaBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; body?: string; ctaText?: string; ctaUrl?: string };
  return <section className="content-section callout"><h2>{fields.headline ?? 'Join the next event'}</h2>{fields.body ? <p>{fields.body}</p> : null}{fields.ctaText && fields.ctaUrl ? <Link className="button" href={fields.ctaUrl}>{fields.ctaText}</Link> : null}</section>;
}
