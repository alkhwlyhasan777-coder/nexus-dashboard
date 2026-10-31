import Badge from "../../components/ui/Badge";
import Icon from "../../components/layout/navbar/Icon";
import PersonAvatar from "../../components/ui/PersonAvatar";
import { button, field, focusRing, muted } from "../../components/ui/tokens";
import { STATUS_TONE, STATUSES } from "./leads.data";

const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;

function Item({ label, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className={`text-xs ${muted}`}>{label}</dt>
      <dd className="mt-0.5 break-words font-medium">{children}</dd>
    </div>
  );
}

/* Everything we know about one lead, plus quick actions and its activity log */
export default function LeadDetails({ lead, t, fmt, onEdit, onDelete, onStatusChange }) {
  const link = `${button.base} no-underline ${focusRing}`;
  const events = [...(lead.activity ?? [])].reverse(); // newest first

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <PersonAvatar name={lead.name} size="size-12" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{lead.name}</h3>
          <p className={`truncate text-sm ${muted}`}>{lead.company || "—"}</p>
        </div>
        <Badge tone={STATUS_TONE[lead.status]}>{t[`s_${lead.status}`]}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`mailto:${lead.email}`} className={`${link} ${button.primary}`}>
          <Icon name="email" size={15} />{t.sendEmail}
        </a>
        {lead.phone && (
          <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className={`${link} ${button.secondary}`}>
            <Icon name="phone" size={15} />{t.call}
          </a>
        )}
        <button type="button" onClick={() => onEdit(lead)} className={`${button.base} ${button.secondary}`}>
          <Icon name="edit" size={15} />{t.edit}
        </button>
        <button type="button" onClick={() => onDelete(lead)} className={`${button.base} ${button.dangerGhost}`}>
          <Icon name="trash" size={15} />{t.delete}
        </button>
      </div>

      <div>
        <label htmlFor="lead-status" className="mb-1.5 block text-sm font-medium">{t.changeStatus}</label>
        <select id="lead-status" value={lead.status} onChange={(e) => onStatusChange(lead, e.target.value)} className={field}>
          {STATUSES.map((s) => <option key={s} value={s}>{t[`s_${s}`]}</option>)}
        </select>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <Item label={t.email} className="col-span-2"><Ltr>{lead.email}</Ltr></Item>
        <Item label={t.phone}>{lead.phone ? <Ltr>{lead.phone}</Ltr> : "—"}</Item>
        <Item label={t.company}>{lead.company || "—"}</Item>
        <Item label={t.source}>{t[`src_${lead.source}`]}</Item>
        <Item label={t.value}>{fmt.money.format(lead.value)}</Item>
        <Item label={t.created} className="col-span-2">
          <time dateTime={lead.createdAt}>{fmt.fromNow(lead.createdAt)} · {fmt.date.format(new Date(lead.createdAt))}</time>
        </Item>
      </dl>

      {lead.notes && (
        <section>
          <h4 className="mb-1.5 text-sm font-medium">{t.notes}</h4>
          <p className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm leading-6 dark:bg-neutral-950/50">{lead.notes}</p>
        </section>
      )}

      <section>
        <h4 className="mb-3 text-sm font-medium">{t.activity}</h4>
        <ol>
          {events.map((ev, i) => (
            <li key={`${ev.type}-${ev.at}-${i}`} className="relative pb-4 ps-6 last:pb-0">
              <span aria-hidden="true" className="absolute start-0 top-1.5 size-2.5 rounded-full bg-neutral-300 ring-4 ring-white dark:bg-neutral-600 dark:ring-neutral-900" />
              {i < events.length - 1 && <span aria-hidden="true" className="absolute bottom-0 start-[4.5px] top-4 w-px bg-neutral-200 dark:bg-neutral-800" />}
              <p className="text-sm">
                {ev.type === "status" ? t.evStatus(t[`s_${ev.from}`], t[`s_${ev.to}`]) : t.evCreated}
              </p>
              <time dateTime={ev.at} title={fmt.date.format(new Date(ev.at))} className={`text-xs ${muted}`}>{fmt.fromNow(ev.at)}</time>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}