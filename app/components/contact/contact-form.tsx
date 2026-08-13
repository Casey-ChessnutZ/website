'use client';

import { useState } from 'react';

import { type ContactDraft, validateContactDraft } from './contact-form-utils';

const initialDraft: ContactDraft = { name: '', email: '', subject: '', message: '' };
const draftStorageKey = 'chessnutz-contact-draft';

export default function ContactForm() {
  const [draft, setDraft] = useState<ContactDraft>(initialDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactDraft, string>>>({});
  const [isSaved, setIsSaved] = useState(false);

  const update = (field: keyof ContactDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setIsSaved(false);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateContactDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    window.localStorage.setItem(draftStorageKey, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
    setIsSaved(true);
  };

  return <form className="mt-10 grid gap-6" noValidate onSubmit={submit}>
    <div className="grid gap-6 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-bold">Name<input className="min-h-11 border border-rule bg-paper-raised px-3 text-base font-normal outline-none transition focus:border-ink" value={draft.name} onChange={(event) => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} /></label>
      <label className="grid gap-2 text-sm font-bold">Email<input className="min-h-11 border border-rule bg-paper-raised px-3 text-base font-normal outline-none transition focus:border-ink" type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} /></label>
    </div>
    {errors.name ? <p className="-mt-4 text-sm text-oxblood" id="contact-name-error" role="alert">{errors.name}</p> : null}
    {errors.email ? <p className="-mt-4 text-sm text-oxblood" id="contact-email-error" role="alert">{errors.email}</p> : null}
    <label className="grid gap-2 text-sm font-bold">Subject<input className="min-h-11 border border-rule bg-paper-raised px-3 text-base font-normal outline-none transition focus:border-ink" value={draft.subject} onChange={(event) => update('subject', event.target.value)} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} /></label>
    {errors.subject ? <p className="-mt-4 text-sm text-oxblood" id="contact-subject-error" role="alert">{errors.subject}</p> : null}
    <label className="grid gap-2 text-sm font-bold">Message<textarea className="min-h-40 border border-rule bg-paper-raised px-3 py-2 text-base font-normal outline-none transition focus:border-ink" value={draft.message} onChange={(event) => update('message', event.target.value)} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} /></label>
    {errors.message ? <p className="-mt-4 text-sm text-oxblood" id="contact-message-error" role="alert">{errors.message}</p> : null}
    <div className="flex flex-wrap items-center gap-4"><button className="min-h-11 cursor-pointer bg-oxblood px-5 py-3 text-sm font-bold text-paper transition duration-200 ease-editorial hover:-translate-y-px hover:bg-oxblood-dark" type="submit">Save message draft</button><p className="m-0 max-w-120 text-sm text-muted">Email delivery is coming soon. Your valid message is saved only in this browser for now.</p></div>
    {isSaved ? <p className="m-0 border-l-2 border-brass pl-3 text-sm" role="status">Your draft is saved. It has not been sent yet.</p> : null}
  </form>;
}
