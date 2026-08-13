import type { EventEntry } from '@/app/lib/contentful/types';

function directionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export default function EventVenue({ event }: { event: EventEntry }) {
  const address = event.venueAddress ?? event.locationDetails;
  const canEmbedMap = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY && event.venueLocation);
  if (!event.locationName && !address) return null;

  const destination = address ?? event.locationName ?? '';
  const mapQuery = event.venueLocation ? `${event.venueLocation.lat},${event.venueLocation.lon}` : destination;
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY}&q=${encodeURIComponent(mapQuery)}`;

  return <section className="scroll-mt-28 border-t border-rule pt-8" id="venue"><p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brass">Find the board</p><h2 className="text-[clamp(2.3rem,5vw,4rem)] leading-none">Venue</h2><div className="mt-8 grid overflow-hidden border border-rule bg-paper-raised lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.72fr)]">{canEmbedMap ? <iframe className="min-h-80 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapUrl} title={`Map of ${event.locationName ?? destination}`} /> : <div className="grid min-h-80 place-items-center bg-ink p-8 text-center text-paper"><div><svg aria-hidden="true" className="mx-auto size-12 text-brass" fill="none" viewBox="0 0 24 24"><path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /><path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.5" /></svg><p className="mt-4 font-display text-3xl leading-none">Venue map</p><p className="mt-3 text-paper/70">Interactive map will appear once venue coordinates and the Google Maps key are available.</p></div></div>}<div className="p-6 sm:p-8"><h3 className="text-3xl leading-none">{event.locationName ?? 'Venue details'}</h3>{address ? <address className="mt-4 not-italic leading-7 text-muted">{address}</address> : null}{event.venueNotes ? <p className="mt-5 text-muted">{event.venueNotes}</p> : null}{destination ? <a className="mt-7 inline-flex min-h-11 items-center border border-oxblood px-4 py-2 text-sm font-bold text-oxblood no-underline transition-colors duration-200 hover:bg-oxblood hover:text-paper" href={directionsUrl(destination)} rel="noreferrer" target="_blank">Open directions <span aria-hidden="true" className="ml-2">↗</span></a> : null}</div></div></section>;
}
