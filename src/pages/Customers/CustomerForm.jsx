import { useId, useMemo, useRef, useState } from "react";
import { button, field } from "../../components/ui/tokens";
import { COUNTRIES, STATUSES } from "./customers.data";

const EMPTY = { name: "", email: "", phone: "", company: "", country: "", status: "active", orders: "", spent: "" };
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
  Add / edit form. `initial` = existing customer when editing.
  takenEmails: Set of lowercase emails that belong to OTHER customers.
*/
export default function CustomerForm({ t, fmt, locale, initial, takenEmails, onSubmit, onCancel }) {
  const uid = useId();
  const formRef = useRef(null);
  const [values, setValues] = useState(() =>
    initial ? { ...EMPTY, ...initial, orders: String(initial.orders), spent: String(initial.spent) } : EMPTY
  );
  const [touched, setTouched] = useState({});

  const countries = useMemo(
    () => [...COUNTRIES].sort((a, b) => fmt.region(a).localeCompare(fmt.region(b), locale)),
    [fmt, locale]
  );

  const errors = {};
  if (!values.name.trim()) errors.name = t.required;
  const email = values.email.trim().toLowerCase();
  if (!email) errors.email = t.required;
  else if (!EMAIL_RE.test(email)) errors.email = t.invalidEmail;
  else if (takenEmails.has(email)) errors.email = t.dupEmail;
  if (!values.country) errors.country = t.required;
  ["orders", "spent"].forEach((k) => {
    const n = Number(values[k]);
    if (values[k] !== "" && (!Number.isFinite(n) || n < 0)) errors[k] = t.invalidNumber;
  });

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
      country: values.country,
      status: values.status,
      orders: Math.round(Number(values.orders) || 0),
      spent: Number(values.spent) || 0,
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
        <Field id={`${uid}-country`} label={t.country} error={shown("country")} required>
          <select {...bind("country")} className={field}>
            <option value="">{t.selectCountry}</option>
            {countries.map((code) => <option key={code} value={code}>{fmt.region(code)}</option>)}
          </select>
        </Field>
        <Field id={`${uid}-status`} label={t.status}>
          <select {...bind("status")} className={field}>
            {STATUSES.map((s) => <option key={s} value={s}>{t[s]}</option>)}
          </select>
        </Field>
        <Field id={`${uid}-orders`} label={t.ordersField} error={shown("orders")}>
          <input {...bind("orders")} type="number" min="0" step="1" inputMode="numeric" placeholder="0" className={field} />
        </Field>
        <Field id={`${uid}-spent`} label={t.spentField} error={shown("spent")}>
          <input {...bind("spent")} type="number" min="0" step="0.01" inputMode="decimal" placeholder="0" className={field} />
        </Field>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={`${button.base} ${button.secondary}`}>{t.cancel}</button>
        <button type="submit" className={`${button.base} ${button.primary}`}>{initial ? t.save : t.create}</button>
      </div>
    </form>
  );
}