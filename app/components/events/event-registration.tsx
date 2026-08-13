import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventRegistration({ event }: { event: EventEntry }) {
  return <section className="event-section">{event.prizeInformation ? <><h2>Prizes</h2><p>{event.prizeInformation}</p></> : null}{event.eligibility ? <><h2>Eligibility</h2><p>{event.eligibility}</p></> : null}{event.registrationUrl ? <a className="button" href={event.registrationUrl} target="_blank" rel="noreferrer">Register now</a> : null}</section>;
}
