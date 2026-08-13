import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventRegistration({ event }: { event: EventEntry }) {
  return <section className="mt-12 border-t border-rule pt-8">{event.prizeInformation ? <><h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-none">Prizes</h2><p>{event.prizeInformation}</p></> : null}{event.eligibility ? <><h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-none">Eligibility</h2><p>{event.eligibility}</p></> : null}{event.registrationUrl ? <a className="mt-8 inline-flex min-h-11 items-center justify-center bg-oxblood px-[1.1rem] py-[0.78rem] text-sm font-bold leading-tight text-paper no-underline transition duration-200 ease-editorial hover:-translate-y-px hover:bg-oxblood-dark" href={event.registrationUrl} target="_blank" rel="noreferrer">Register now</a> : null}</section>;
}
