import { useMemo } from "react";
import Badge from "../../components/ui/Badge";
import Highlight from "../../components/ui/Highlight";
import Icon from "../../components/layout/navbar/Icon";
import IconButton from "../../components/layout/navbar/IconButton";
import PersonAvatar from "../../components/ui/PersonAvatar";
import { button, focusRing, muted } from "../../components/ui/tokens";
import { STATUS_TONE } from "./leads.data";
import { Link } from "react-router-dom";
import { Created, Ltr } from "./LeadTableParts";

/* Builds the DataTable columns and the card layout for leads */
export default function useLeadTable({ t, fmt, query, search, onEdit, onDelete }) {
  return useMemo(() => {
    const identity = (l, className = "max-w-[280px]") => (
      <Link
        to={`/leads/${l.id}`}
        state={{ from: search }}
        aria-label={t.viewNamed(l.name)}
        className={`flex min-w-0 items-center gap-3 rounded-lg text-start no-underline ${focusRing} ${className}`}
      >
        <PersonAvatar name={l.name} />
        <span className="min-w-0">
          <span className="block truncate font-medium"><Highlight text={l.name} query={query} /></span>
          <span className={`block truncate text-xs ${muted}`}><Ltr><Highlight text={l.email} query={query} /></Ltr></span>
        </span>
      </Link>
    );
    const status = (l) => <Badge tone={STATUS_TONE[l.status]}>{t[`s_${l.status}`]}</Badge>;

    const columns = [
      { id: "name", header: t.lead, sortable: true, cell: (l) => identity(l) },
      { id: "status", header: t.status, sortable: true, min: 560, cell: status },
      { id: "value", header: t.value, sortable: true, min: 680, align: "end", cell: (l) => <span className="font-medium tabular-nums">{fmt.money.format(l.value)}</span> },
      { id: "company", header: t.company, sortable: true, min: 800, cell: (l) => l.company || "—" },
      { id: "source", header: t.source, sortable: true, min: 920, cell: (l) => t[`src_${l.source}`] },
      { id: "createdAt", header: t.created, sortable: true, min: 1020, cell: (l) => <Created iso={l.createdAt} fmt={fmt} /> },
      {
        id: "actions", header: t.actions, hideHeader: true, align: "end",
        cell: (l) => (
          <div className="flex justify-end gap-1">
            <IconButton label={t.editNamed(l.name)} onClick={() => onEdit(l)}><Icon name="edit" size={16} /></IconButton>
            <IconButton label={t.deleteNamed(l.name)} onClick={() => onDelete(l)} className="hover:text-red-600 dark:hover:text-red-400">
              <Icon name="trash" size={16} />
            </IconButton>
          </div>
        ),
      },
    ];

    const renderCard = (l) => (
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {identity(l, "flex-1")}
          {status(l)}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {[
            [t.value, fmt.money.format(l.value)],
            [t.created, <Created key="c" iso={l.createdAt} fmt={fmt} />],
            [t.company, l.company || "—"],
            [t.source, t[`src_${l.source}`]],
          ].map(([key, value]) => (
            <div key={key} className="min-w-0">
              <dt className={`text-xs ${muted}`}>{key}</dt>
              <dd className="truncate font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => onEdit(l)} aria-label={t.editNamed(l.name)} className={`${button.base} ${button.secondary} flex-1`}>
            <Icon name="edit" size={15} />{t.edit}
          </button>
          <button type="button" onClick={() => onDelete(l)} aria-label={t.deleteNamed(l.name)} className={`${button.base} ${button.dangerGhost} flex-1`}>
            <Icon name="trash" size={15} />{t.delete}
          </button>
        </div>
      </div>
    );

    return { columns, renderCard };
  }, [t, fmt, query, search, onEdit, onDelete]);
}
