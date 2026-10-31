import { useId, useRef, useState } from "react";
import { button, field, textarea } from "../../components/ui/tokens";
import { SOURCES, STATUSES } from "./leads.data";

const EMPTY = { name: "", email: "", phone: "", company: "", source: "", status: "new", value: "", notes: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ id, label, error, required, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span aria-hidden="true" className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

/*
  Add / edit form. `initial` = existing lead when editing.
  takenEmails: Set of lowercase emails that belong to OTHER leads.
*/
export default function LeadForm({ t, initial, takenEmails, onSubmit, onCancel }) {
  const uid = useId();
  const formRef = useRef(null);
  const [values, setValues] = useState(() => (initial ? { ...EMPTY, ...initial, value: String(initial.value) } : EMPTY));
  const [touched, setTouched] = useState({});

  const errors = {};
  if (!values.name.trim()) errors.name = t.required;
  const email = values.email.trim().toLowerCase();
  if (!email) errors.email = t.required;
  else if (!EMAIL_RE.test(email)) errors.email = t.invalidEmail;
  else if (takenEmails.has(email)) errors.email = t.dupEmail;
  if (!values.source) errors.source = t.required;
  const amount = Number(values.value);
  if (values.value !== "" && (!Number.isFinite(amount) || amount < 0)) errors.value = t.invalidNumber;

  const shown = (name) => ((touched.all || touched[name]) ? errors[name] : undefined);
  const bind = (name) => ({
    id: `${uid}-${name}`,
    name,
    value: values[name],
    onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
    onBlur: () => setTouched((tc) => ({ ...tc, [name]: true })),
    "aria-invalid": shown(name) ? "true" : undefined,
    "aria-describedby": shown(name) ? `${uid}-${name}-err` : undefined,
  });

  const submit = (e) => {
    e.preventDefault();
    setTouched({ all: true });
    if (Object.keys(errors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    onSubmit({
      ...(initial ?? {}),
      name: values.name.trim(),
      email,
      phone: values.phone.trim(),
      company: values.company.trim(),
      source: values.source,
      status: values.status,
      value: Number(values.value) || 0,
      notes: values.notes.trim(),
    });
  };

  return (
    <form ref={formRef} onSubmit={submit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${uid}-name`} label={t.name} error={shown("name")} required className="sm:col-span-2">
          <input {...bind("name")} data-autofocus type="text" autoComplete="off" className={field} />
        </Field>
        <Field id={`${uid}-email`} label={t.email} error={shown("email")} required>
          <input {...bind("email")} type="email" dir="ltr" autoComplete="off" className={field} />
        </Field>
        <Field id={`${uid}-phone`} label={t.phone}>
          <input {...bind("phone")} type="tel" dir="ltr" autoComplete="off" className={field} />
        </Field>
        <Field id={`${uid}-company`} label={t.company}>
          <input {...bind("company")} type="text" autoComplete="off" className={field} />
        </Field>
        <Field id={`${uid}-source`} label={t.sourceField} error={shown("source")} required>
          <select {...bind("source")} className={field}>
            <option value="">{t.selectSource}</option>
            {SOURCES.map((s) => <option key={s} value={s}>{t[`src_${s}`]}</option>)}
          </select>
        </Field>
        <Field id={`${uid}-status`} label={t.statusField}>
          <select {...bind("status")} className={field}>
            {STATUSES.map((s) => <option key={s} value={s}>{t[`s_${s}`]}</option>)}
          </select>
        </Field>
        <Field id={`${uid}-value`} label={t.valueField} error={shown("value")}>
          <input {...bind("value")} type="number" min="0" step="1" inputMode="decimal" placeholder="0" className={field} />
        </Field>
        <Field id={`${uid}-notes`} label={t.notes} className="sm:col-span-2">
          <textarea {...bind("notes")} rows={3} placeholder={t.notesPlaceholder} className={textarea} />
        </Field>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={`${button.base} ${button.secondary}`}>{t.cancel}</button>
        <button type="submit" className={`${button.base} ${button.primary}`}>{initial ? t.save : t.create}</button>
      </div>
    </form>
  );
}