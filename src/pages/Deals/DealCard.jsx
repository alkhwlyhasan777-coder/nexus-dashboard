import { Link } from "react-router-dom";
import Icon from "../../components//layout/navbar/Icon";
import IconButton from "../../components/layout/navbar/IconButton";
import PersonAvatar from "../../components/ui/PersonAvatar";
import Highlight from "../../components/ui/Highlight";
import { focusRing, hairline, muted } from "../../components/ui/tokens";

import { daysBetween, parseISODate } from "../../lib/dates";
import { isOpen, PROBABILITY, STAGES } from "./deals.data";

/* Who the deal is with: a lead (links to its page) or a customer */
export function ClientLine({ client, t, query = "", className = "" }) {
  const name = <Highlight text={client.name} query={query} />;
  return (
    <p className={`flex min-w-0 items-center gap-1.5 text-xs ${className}`}>
      <PersonAvatar name={client.name} size="size-5" className="text-[9px]" />
      {client.type === "lead" && !client.missing ? (
        <Link to={`/leads/${client.id}`} state={{ from: "" }} aria-label={t.viewLead(client.name)} className={`truncate font-medium hover:underline ${focusRing} rounded-sm`}>{name}</Link>
      ) : (
        <span className="truncate font-medium">{name}</span>
      )}
      <span className={`shrink-0 rounded bg-neutral-100 px-1.5 py-px text-[10px] font-medium dark:bg-neutral-800 ${muted}`}>
        {client.missing ? t.clientRemoved : client.type === "lead" ? t.clientLead : t.clientCustomer}
      </span>
    </p>
  );
}

/* Expected closing date, red when overdue and amber when it is within a week */
export function CloseDate({ deal, t, fmt, today }) {
  const open = isOpen(deal);
  const days = daysBetween(today, deal.expectedClose);
  const exact = fmt.date.format(parseISODate(deal.expectedClose));

  if (!open) {
    const closed = deal.closedAt ? fmt.date.format(new Date(deal.closedAt)) : exact;
    return <span className={`inline-flex items-center gap-1 text-xs ${muted}`}><Icon name="calendar" size={13} />{t.closedOn(closed)}</span>;
  }
  const tone = days < 0 ? "text-red-600 dark:text-red-400" : days <= 7 ? "text-amber-600 dark:text-amber-400" : muted;
  return (
    <time dateTime={deal.expectedClose} title={exact} className={`inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
      <Icon name="calendar" size={13} />
      {days < 0
        ? t.daysOverdue(Math.abs(days))
        : days === 0
          ? t.dueToday
          : t.daysLeft(days)}
      {days < 0 && <span className="sr-only"> ({t.overdueBadge})</span>}
    </time>
  );
}

/* The inside of a deal card. The board wraps it in a draggable <li>. */
export default function DealCard({ deal, client, t, fmt, today, query, onEdit, onDelete, onMove }) {
  const open = isOpen(deal);
  return (
    <div className="space-y-3 p-3">
      <div className="flex items-start gap-2">
        <button type="button" onClick={() => onEdit(deal)} className={`min-w-0 flex-1 rounded-md text-start text-sm font-semibold leading-snug ${focusRing}`}>
          <Highlight text={deal.title} query={query} />
        </button>
        <div className="-me-1 -mt-1 flex shrink-0">
          <IconButton size="sm" label={t.editNamed(deal.title)} onClick={() => onEdit(deal)}><Icon name="edit" size={14} /></IconButton>
          <IconButton size="sm" label={t.deleteNamed(deal.title)} onClick={() => onDelete(deal)} className="hover:text-red-600 dark:hover:text-red-400"><Icon name="trash" size={14} /></IconButton>
        </div>
      </div>

      <ClientLine client={client} t={t} query={query} />

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-base font-semibold tabular-nums">{fmt.money.format(deal.value)}</p>
          {open && <p className={`text-[11px] ${muted}`}>{t.chance(fmt.percent.format(PROBABILITY[deal.stage]))}</p>}
        </div>
        <CloseDate deal={deal} t={t} fmt={fmt} today={today} />
      </div>

      {/* Keyboard and touch alternative to dragging */}
      <select
        value={deal.stage}
        onChange={(e) => onMove(deal, e.target.value)}
        aria-label={t.moveNamed(deal.title)}
        className={`h-7 w-full rounded-md border bg-neutral-50 px-1.5 text-xs dark:bg-neutral-950 ${hairline} ${focusRing}`}
      >
        {STAGES.map((s) => <option key={s} value={s}>{t[`st_${s}`]}</option>)}
      </select>
    </div>
  );
}