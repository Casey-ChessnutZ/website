import type { EventEntry } from '@/app/lib/contentful/types';

export default function EventScheduleTimeline({ event }: { event: EventEntry }) {
  if (!event.scheduleItems?.length && !event.schedule) return null;

  return <section className="scroll-mt-28 border-t border-rule pt-8" id="schedule"><p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brass">Over the board</p><h2 className="text-[clamp(2.3rem,5vw,4rem)] leading-none">Schedule</h2>{event.scheduleItems?.length ? <ol className="mt-8 border-l border-brass/65">{event.scheduleItems.map((item, index) => <li className="relative grid gap-1 pb-8 pl-7 md:grid-cols-[11rem_1fr] md:gap-6" key={`${item.time}-${item.title}`}><span aria-hidden="true" className="absolute -left-[0.35rem] top-1.5 size-2.5 rounded-full bg-oxblood ring-4 ring-paper" /><time className="text-sm font-bold text-oxblood">{item.time}</time><div><h3 className="text-2xl leading-none">{item.title}</h3>{item.detail ? <p className="mb-0 mt-2 text-muted">{item.detail}</p> : null}</div></li>)}</ol> : <p className="mt-5 max-w-152 whitespace-pre-wrap text-muted">{event.schedule}</p>}</section>;
}
