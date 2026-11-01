import { useMemo } from "react";
import Badge from "../../components/ui/Badge";
import Highlight from "../../components/ui/Highlight";
import Icon from "../../components/layout/navbar/Icon";
import IconButton from "../../components/layout/navbar/IconButton";
import { muted } from "../../components/ui/tokens";

import { parseISODate } from "../../lib/dates";
import { ClientLine, CloseDate } from "./DealCard";
import DealCard from "./DealCard";
import { PROBABILITY, STAGE_TONE } from "./deals.data";

/* Builds the DataTable columns and the narrow-screen card for the list view */
export default function useDealTable({ t, fmt, today, query, resolve, onEdit, onDelete, onMove }) {
  return useMemo(() => {
    const stage = (d) => <Badge tone={STAGE_TONE[d.stage]}>{t[`st_${d.stage}`]}</Badge>;

    const columns = [
      {
        id: "title", header: t.deal, sortable: true,
        cell: (d) => (
          <div className="max-w-[300px] min-w-0">
            <p className="truncate font-medium"><Highlight text={d.title} query={query} /></p>
            <ClientLine client={resolve(d)} t={t} query={query} className={`mt-0.5 ${muted}`} />
          </div>
        ),
      },
      { id: "stage", header: t.stage, sortable: true, min: 560, cell: stage },
      { id: "value", header: t.value, sortable: true, min: 680, align: "end", cell: (d) => <span className="font-medium tabular-nums">{fmt.money.format(d.value)}</span> },
      {
        id: "expectedClose", header: t.expectedClose, sortable: true, min: 800,
        cell: (d) => (
          <div className="leading-tight">
            <CloseDate deal={d} t={t} fmt={fmt} today={today} />
            <p className={`mt-0.5 text-xs ${muted}`}>{fmt.date.format(parseISODate(d.expectedClose))}</p>
          </div>
        ),
      },
      { id: "weighted", header: t.weightedCol, min: 1000, align: "end", cell: (d) => <span className="tabular-nums">{fmt.money.format(Math.round(d.value * PROBABILITY[d.stage]))}</span> },
      {
        id: "actions", header: t.actions, hideHeader: true, align: "end",
        cell: (d) => (
          <div className="flex justify-end gap-1">
            <IconButton label={t.editNamed(d.title)} onClick={() => onEdit(d)}><Icon name="edit" size={16} /></IconButton>
            <IconButton label={t.deleteNamed(d.title)} onClick={() => onDelete(d)} className="hover:text-red-600 dark:hover:text-red-400"><Icon name="trash" size={16} /></IconButton>
          </div>
        ),
      },
    ];

    const renderCard = (d) => (
      <DealCard deal={d} client={resolve(d)} t={t} fmt={fmt} today={today} query={query} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />
    );

    return { columns, renderCard };
  }, [t, fmt, today, query, resolve, onEdit, onDelete, onMove]);
}