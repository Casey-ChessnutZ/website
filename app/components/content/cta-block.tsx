import Link from 'next/link';
import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function CtaBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; body?: string; ctaText?: string; ctaUrl?: string };
  return <section className="mx-auto mt-28 max-w-304 bg-ink px-5 py-18 text-paper"><h2 className="max-w-[15ch] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98]">{fields.headline ?? 'Join the next event'}</h2>{fields.body ? <p className="max-w-144">{fields.body}</p> : null}{fields.ctaText && fields.ctaUrl ? <Link className="mt-8 inline-flex min-h-11 items-center justify-center bg-brass px-[1.1rem] py-[0.78rem] text-sm font-bold leading-tight text-ink no-underline transition duration-200 ease-editorial hover:bg-[#d6ae71]" href={fields.ctaUrl}>{fields.ctaText}</Link> : null}</section>;
}
