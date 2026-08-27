'use client';

import { useState } from 'react';

import type { ContactFormDefinition } from '@/app/lib/contentful/types';

export default function ContactForm({ definition }: { definition: ContactFormDefinition }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, website: '' }) }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    setIsSubmitting(false);
    if (!response?.ok) {
      setStatus({ type: 'error', message: payload?.error ?? 'We could not send your message. Please try again.' });
      return;
    }
    setValues({});
    setStatus({ type: 'success', message: payload?.successMessage ?? definition.successMessage });
  };

  return <form className="mt-10 grid gap-6" noValidate onSubmit={submit}>
    <div aria-hidden="true" className="hidden"><label>Website<input autoComplete="off" name="website" tabIndex={-1} /></label></div>
    {definition.fields.map((field) => <label className="grid gap-2 text-sm font-bold" key={field.id}>{field.label}
      {field.type === 'textarea' ? <textarea className="min-h-40 border border-rule bg-paper-raised px-3 py-2 text-base font-normal outline-none transition focus:border-ink" name={field.id} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} placeholder={field.placeholder} required={field.required} value={values[field.id] ?? ''} />
        : field.type === 'select' ? <select className="min-h-11 border border-rule bg-paper-raised px-3 text-base font-normal outline-none transition focus:border-ink" name={field.id} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} required={field.required} value={values[field.id] ?? ''}><option value="">Select an option</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select>
          : <input className="min-h-11 border border-rule bg-paper-raised px-3 text-base font-normal outline-none transition focus:border-ink" name={field.id} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} placeholder={field.placeholder} required={field.required} type={field.type} value={values[field.id] ?? ''} />}
      {field.helpText ? <span className="text-sm font-normal text-muted">{field.helpText}</span> : null}
    </label>)}
    <button className="min-h-11 cursor-pointer bg-oxblood px-5 py-3 text-sm font-bold text-paper transition duration-200 ease-editorial hover:-translate-y-px hover:bg-oxblood-dark disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Sending…' : 'Send message'}</button>
    {status ? <p className={`m-0 border-l-2 pl-3 text-sm ${status.type === 'error' ? 'border-oxblood text-oxblood' : 'border-brass'}`} role="status">{status.message}</p> : null}
  </form>;
}
