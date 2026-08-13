import type { LandingPageBlock } from '@/app/lib/contentful/types';
import Link from 'next/link';

export default function HeroBlock({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { headline?: string; title?: string; body?: string; eyebrow?: string; media?: { url?: string; title?: string }; ctaText?: string; ctaUrl?: string; secondaryCtaLabel?: string; secondaryCtaUrl?: string };
  const headline = fields.headline ?? fields.title ?? '';
  const body = fields.body ?? '';

  return (
    <section className="relative isolate grid min-h-[min(42rem,calc(100dvh-4.75rem))] overflow-hidden bg-ink text-paper" aria-labelledby="home-title">
      {fields.media?.url ? <img alt={fields.media.title ?? ''} className="absolute inset-0 -z-20 size-full object-cover opacity-55" src={fields.media.url} /> : null}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(16_12_10_/_0.96),rgb(22_14_13_/_0.55),rgb(22_14_13_/_0.2))]" />
      <div className="mx-auto flex w-full max-w-304 flex-col justify-end px-5 py-16 md:py-24"><div className="max-w-184 animate-rise-in motion-reduce:animate-none">{fields.eyebrow ? <p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">{fields.eyebrow}</p> : null}{typeof headline === 'string' ? <h1 className="max-w-[10ch] text-[clamp(3rem,9vw,7rem)] leading-[0.91]" id="home-title">{headline}</h1> : null}{typeof body === 'string' ? <p className="mt-6 max-w-144 text-lg">{body}</p> : null}{fields.ctaText && fields.ctaUrl ? <div className="mt-8 flex flex-wrap gap-3"><Link className="inline-flex min-h-11 items-center bg-oxblood px-5 text-sm font-bold text-paper no-underline transition hover:-translate-y-px hover:bg-oxblood-dark" href={fields.ctaUrl}>{fields.ctaText}</Link>{fields.secondaryCtaLabel && fields.secondaryCtaUrl ? <Link className="inline-flex min-h-11 items-center border border-paper/70 px-5 text-sm font-bold text-paper no-underline transition hover:bg-paper hover:text-ink" href={fields.secondaryCtaUrl}>{fields.secondaryCtaLabel}</Link> : null}</div> : null}</div></div>
    </section>
  );
}
