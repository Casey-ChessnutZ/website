import ContactForm from '@/app/components/contact/contact-form';
import { getPageMetadata } from '@/app/lib/seo/metadata';

export async function generateMetadata() { return getPageMetadata('Contact', 'Contact the ChessNutZ tournament organisers.', '/contact'); }

export default function ContactPage() {
  return <main className="mx-auto max-w-224 px-5 pt-12 pb-28" id="main-content"><section className="max-w-168"><p className="mb-4 text-[0.73rem] font-bold uppercase tracking-[0.14em] text-brass">Contact</p><h1 className="mb-6 text-[clamp(3.5rem,9vw,7rem)] leading-[0.9]">Start a conversation.</h1><p className="max-w-152 text-[1.15rem] text-muted">Ask about tournament entries, accessibility, partnerships, or information that is not yet on an event page.</p><ContactForm /></section></main>;
}
