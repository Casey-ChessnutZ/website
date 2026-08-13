import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventPairings({ event }: { event: EventEntry }) {
  if (!event.pairingUrl) return null;

  return <section className="mt-12 border-t border-rule pt-8"><h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-none">Pairings</h2><p>Round pairings and results are available on the tournament pairing page.</p><a className="mt-4 inline-flex min-h-11 items-center justify-center bg-ink px-[1.1rem] py-[0.78rem] text-sm font-bold leading-tight text-paper no-underline transition duration-200 ease-editorial hover:bg-oxblood" href={event.pairingUrl} target="_blank" rel="noreferrer">View pairings <span aria-hidden="true">↗</span></a></section>;
}
