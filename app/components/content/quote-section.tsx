import type { LandingPageBlock } from '@/app/lib/contentful/types';

export default function QuoteSection({ block }: { block: LandingPageBlock }) {
  const fields = block.fields as { quote?: string; attribution?: string; role?: string };
  if (!fields.quote) return null;
  return <figure className="mx-auto my-28 max-w-304 border-y border-rule px-5 py-14 text-center"><blockquote className="mx-auto max-w-224 font-display text-[clamp(2rem,5vw,4rem)] leading-[1.02]">“{fields.quote}”</blockquote><figcaption className="mt-7 text-[0.74rem] font-bold uppercase tracking-[0.14em] text-brass">{fields.attribution}{fields.role ? ` · ${fields.role}` : ''}</figcaption></figure>;
}
