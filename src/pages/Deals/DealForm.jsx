import { useId, useMemo, useRef, useState } from "react";
import { button, field, muted, textarea } from "../../components/ui/tokens";

import { parseISODate } from "../../lib/dates";
import { PROBABILITY, STAGES } from "./deals.data";

const EMPTY = { title: "", clientKey: "", stage: "prospecting", value: "", expectedClose: "", notes: "" };
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function Field({ id, label, error, hint, required, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span aria-hidden="true" className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && !error && <p className={`mt-1.5 text-xs ${muted}`}>{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

/*
  Create / edit form. `initial` = existing deal when editing, `defaults` = preset fields for a new deal
  (for example the stage of the column whose "+" was pressed). `clients` = leads and customers to link to.
*/
export default function DealForm({ t, fmt, locale, clients, initial, defaults, onSubmit, onCancel }) {
  const uid = useId();
  const formRef = useRef(null);
  const [values, setValues] = useState(() =>
    initial
      ? {
          title: initial.title, clientKey: `${initial.clientType}:${initial.clientId}`, stage: initial.stage,
          value: String(initial.value), expectedClose: initial.expectedClose, notes: initial.notes ?? "",
        }
      : { ...EMPTY, ...defaults }
  );
  const [touched, setTouched] = useState({});

  const sorted = (type) => clients.filter((c) => c.type === type).sort((a, b) => a.name.localeCompare(b.name, locale));
  const leads = useMemo(() => sorted("lead"), [clients, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  const customers = useMemo(() => sorted("customer"), [clients, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  const known = clients.some((c) => c.key === values.clientKey);

  const errors = {};
  if (!values.title.trim()) errors.title = t.required;
  if (!values.clientKey) errors.clientKey = t.required;
  const amount = Number(values.value);
  if (values.value === "") errors.value = t.required;
  else if (!Number.isFinite(amount) || amount < 0) errors.value = t.invalidNumber;
  if (!values.expectedClose) errors.expectedClose = t.required;
  else if (!DATE_RE.test(values.expectedClose) || Number.isNaN(parseISODate(values.expectedClose).getTime())) errors.expectedClose = t.invalidDate;

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
    const [clientType, ...rest] = values.clientKey.split(":");
    const clientId = rest.join(":");
    const client = clients.find((c) => c.key === values.clientKey);
    onSubmit({
      ...(initial ?? {}),
      title: values.title.trim(),
      clientType, clientId,
      clientName: client?.name ?? initial?.clientName ?? "",
      stage: values.stage,
      value: amount,
      expectedClose: values.expectedClose,
      notes: values.notes.trim(),
    });
  };

  const option = (c) => <option key={c.key} value={c.key}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>;

  return (
    <form ref={formRef} onSubmit={submit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${uid}-title`} label={t.dealTitle} error={shown("title")} required className="sm:col-span-2">
          <input {...bind("title")} data-autofocus type="text" autoComplete="off" placeholder={t.titlePlaceholder} className={field} />
        </Field>

        <Field id={`${uid}-clientKey`} label={t.clientField} error={shown("clientKey")} required className="sm:col-span-2">
          <select {...bind("clientKey")} className={field}>
            <option value="">{t.selectClient}</option>
            {initial && !known && values.clientKey && <option value={values.clientKey}>{initial.clientName} ({t.clientRemoved})</option>}
            <optgroup label={t.groupLeads}>{leads.map(option)}</optgroup>
            <optgroup label={t.groupCustomers}>{customers.map(option)}</optgroup>
          </select>
        </Field>

        <Field id={`${uid}-value`} label={t.valueField} error={shown("value")} required>
          <input {...bind("value")} type="number" min="0" step="1" inputMode="decimal" placeholder="0" className={field} />
        </Field>
        <Field id={`${uid}-expectedClose`} label={t.closeField} error={shown("expectedClose")} required>
          <input {...bind("expectedClose")} type="date" dir="ltr" className={field} />
        </Field>

        <Field id={`${uid}-stage`} label={t.stageField} hint={t.chanceHint(fmt.percent.format(PROBABILITY[values.stage]))} className="sm:col-span-2">
          <select {...bind("stage")} className={field}>
            {STAGES.map((s) => <option key={s} value={s}>{t[`st_${s}`]}</option>)}
          </select>
        </Field>

        <Field id={`${uid}-notes`} label={t.notes} className="sm:col-span-2">
          <textarea {...bind("notes")} rows={3} className={textarea} />
        </Field>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={`${button.base} ${button.secondary}`}>{t.cancel}</button>
        <button type="submit" className={`${button.base} ${button.primary}`}>{initial ? t.save : t.create}</button>
      </div>
    </form>
  );
}