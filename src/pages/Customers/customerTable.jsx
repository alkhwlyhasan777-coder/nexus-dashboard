import { useMemo } from "react";
import Highlight from "../../components/ui/Highlight";
import Icon from "../../components/layout/navbar/Icon";
import IconButton from "../../components/layout/navbar/IconButton";
import { accent, button, muted } from "../../components/ui/tokens";
import { isNew } from "./customers.data";

const STATUS_STYLE = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  inactive: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};
const STATUS_DOT = { active: "bg-emerald-500", inactive: "bg-neutral-400", pending: "bg-amber-500" };
const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];

export function StatusBadge({ status, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[status]}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {label}
    </span>
  );
}

function CustomerAvatar({ name, size = "size-10" }) {
  const hash = [...name].reduce((h, ch) => (h * 31 + ch.codePointAt(0)) >>> 0, 7);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span aria-hidden="true" className={`grid ${size} shrink-0 place-items-center rounded-full text-xs font-semibold text-white ${AVATAR_COLORS[hash % AVATAR_COLORS.length]}`}>
      {initials}
    </span>
  );
}

const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;

/* Amount with a thin bar showing how it compares with the biggest customer */
function Spent({ value, max, fmt, wide = true }) {
  const pct = Math.max(2, Math.round((value / max) * 100));
  return (
    <div className={`flex flex-col gap-1 ${wide ? "items-end" : "items-start"}`}>
      <span className="font-medium tabular-nums">{fmt.money.format(value)}</span>
      <span aria-hidden="true" className="h-1 w-20 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <span className={`block h-full rounded-full ${accent.bg}`} style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

/* "3 days ago" with the exact date underneath (and in the tooltip) */
function Joined({ iso, fmt }) {
  const exact = fmt.date.format(new Date(iso));
  return (
    <time dateTime={iso} title={exact} className="block leading-tight">
      <span className="font-medium">{fmt.fromNow(iso)}</span>
      <span className={`block text-xs ${muted}`}>{exact}</span>
    </time>
  );
}

/* Builds the DataTable column list and the card layout for customers */
export default function useCustomerTable({ t, fmt, query, maxSpent, onView, onEdit, onDelete }) {
  return useMemo(() => {
    const identity = (c, className = "max-w-[280px]") => (
      <div className={`flex min-w-0 items-center gap-3 ${className}`}>
        <CustomerAvatar name={c.name} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-medium">
            <span className="truncate"><Highlight text={c.name} query={query} /></span>
            {isNew(c) && <span className={`shrink-0 rounded-full px-1.5 py-px text-[10px] font-semibold ${accent.soft}`}>{t.newBadge}</span>}
          </p>
          <p className={`truncate text-xs ${muted}`}><Ltr><Highlight text={c.email} query={query} /></Ltr></p>
        </div>
      </div>
    );

    const columns = [
      { id: "name", header: t.customer, sortable: true, cell: (c) => identity(c) },
      { id: "status", header: t.status, sortable: true, min: 600, cell: (c) => <StatusBadge status={c.status} label={t[c.status]} /> },
      { id: "spent", header: t.spent, sortable: true, min: 700, align: "end", cell: (c) => <Spent value={c.spent} max={maxSpent} fmt={fmt} /> },
      { id: "joined", header: t.joined, sortable: true, min: 820, cell: (c) => <Joined iso={c.joined} fmt={fmt} /> },
      { id: "company", header: t.company, min: 920, cell: (c) => <Highlight text={c.company || "—"} query={query} /> },
      { id: "orders", header: t.orders, sortable: true, min: 1020, align: "end", cell: (c) => <span className="tabular-nums">{fmt.nf.format(c.orders)}</span> },
      { id: "country", header: t.country, sortable: true, min: 1120, cell: (c) => fmt.region(c.country) },
      { id: "phone", header: t.phone, min: 1240, cell: (c) => (c.phone ? <Ltr>{c.phone}</Ltr> : "—") },
      {
        id: "actions", header: t.actions, hideHeader: true, align: "end",
        cell: (c) => (
          <div className="flex justify-end gap-1">
            <IconButton label={t.viewNamed(c.name)} onClick={() => onView(c)}><Icon name="customers" size={16} /></IconButton>
            <IconButton label={t.editNamed(c.name)} onClick={() => onEdit(c)}><Icon name="edit" size={16} /></IconButton>
            <IconButton label={t.deleteNamed(c.name)} onClick={() => onDelete(c)} className="hover:text-red-600 dark:hover:text-red-400">
              <Icon name="trash" size={16} />
            </IconButton>
          </div>
        ),
      },
    ];

    const renderCard = (c) => (
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {identity(c, "flex-1")}
          <StatusBadge status={c.status} label={t[c.status]} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="min-w-0"><dt className={`text-xs ${muted}`}>{t.spent}</dt><dd><Spent value={c.spent} max={maxSpent} fmt={fmt} wide={false} /></dd></div>
          <div className="min-w-0"><dt className={`text-xs ${muted}`}>{t.joined}</dt><dd><Joined iso={c.joined} fmt={fmt} /></dd></div>
          {[
            [t.company, <Highlight key="co" text={c.company || "—"} query={query} />],
            [t.country, fmt.region(c.country)],
            [t.orders, fmt.nf.format(c.orders)],
            [t.phone, c.phone ? <Ltr>{c.phone}</Ltr> : "—"],
          ].map(([key, value]) => (
            <div key={key} className="min-w-0">
              <dt className={`text-xs ${muted}`}>{key}</dt>
              <dd className="truncate font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => onView(c)} aria-label={t.viewNamed(c.name)} className={`${button.base} ${button.secondary} flex-1`}>
            <Icon name="customers" size={15} />{t.view}
          </button>
          <button type="button" onClick={() => onEdit(c)} aria-label={t.editNamed(c.name)} className={`${button.base} ${button.secondary} flex-1`}>
            <Icon name="edit" size={15} />{t.edit}
          </button>
          <button type="button" onClick={() => onDelete(c)} aria-label={t.deleteNamed(c.name)} className={`${button.base} ${button.dangerGhost} flex-1`}>
            <Icon name="trash" size={15} />{t.delete}
          </button>
        </div>
      </div>
    );

    return { columns, renderCard };
  }, [t, fmt, query, maxSpent, onView, onEdit, onDelete]);
}
// /* eslint-disable react-refresh/only-export-components */
// import { useMemo } from "react";
// import Icon from "../../components/layout/navbar/Icon";
// import IconButton from "../../components/layout/navbar/IconButton";
// import { button, muted } from "../../components/ui/tokens";

// const STATUS_STYLE = {
//   active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
//   inactive: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
//   pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
// };
// const STATUS_DOT = { active: "bg-emerald-500", inactive: "bg-neutral-400", pending: "bg-amber-500" };
// const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];

// export function StatusBadge({ status, label }) {
//   return (
//     <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[status]}`}>
//       <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} />
//       {label}
//     </span>
//   );
// }

// function CustomerAvatar({ name }) {
//   const hash = [...name].reduce((h, ch) => (h * 31 + ch.codePointAt(0)) >>> 0, 7);
//   const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
//   return (
//     <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white ${AVATAR_COLORS[hash % AVATAR_COLORS.length]}`}>
//       {initials}
//     </span>
//   );
// }

// const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;

// /* Builds the DataTable column list and the narrow-screen card for customers */
// export default function useCustomerTable({ t, fmt, onEdit, onDelete }) {
//   return useMemo(() => {
//     const identity = (c, className = "max-w-[260px]") => (
//       <div className={`flex min-w-0 items-center gap-3 ${className}`}>
//         <CustomerAvatar name={c.name} />
//         <div className="min-w-0">
//           <p className="truncate font-medium">{c.name}</p>
//           <p className={`truncate text-xs ${muted}`}><Ltr>{c.email}</Ltr></p>
//         </div>
//       </div>
//     );

//     const columns = [
//       { id: "name", header: t.customer, sortable: true, cell: (c) => identity(c) },
//       { id: "status", header: t.status, sortable: true, min: 600, cell: (c) => <StatusBadge status={c.status} label={t[c.status]} /> },
//       { id: "spent", header: t.spent, sortable: true, min: 700, align: "end", cell: (c) => <span className="tabular-nums">{fmt.money.format(c.spent)}</span> },
//       { id: "joined", header: t.joined, sortable: true, min: 820, cell: (c) => fmt.date.format(new Date(c.joined)) },
//       { id: "company", header: t.company, min: 920, cell: (c) => c.company || "—" },
//       { id: "orders", header: t.orders, sortable: true, min: 1020, align: "end", cell: (c) => <span className="tabular-nums">{fmt.nf.format(c.orders)}</span> },
//       { id: "country", header: t.country, sortable: true, min: 1120, cell: (c) => fmt.region(c.country) },
//       { id: "phone", header: t.phone, min: 1240, cell: (c) => (c.phone ? <Ltr>{c.phone}</Ltr> : "—") },
//       {
//         id: "actions", header: t.actions, hideHeader: true, align: "end",
//         cell: (c) => (
//           <div className="flex justify-end gap-1">
//             <IconButton label={t.editNamed(c.name)} onClick={() => onEdit(c)}><Icon name="edit" size={16} /></IconButton>
//             <IconButton label={t.deleteNamed(c.name)} onClick={() => onDelete(c)} className="hover:text-red-600 dark:hover:text-red-400">
//               <Icon name="trash" size={16} />
//             </IconButton>
//           </div>
//         ),
//       },
//     ];

//     const renderCard = (c) => (
//       <div className="p-4">
//         <div className="flex items-start justify-between gap-3">
//           {identity(c, "flex-1")}
//           <StatusBadge status={c.status} label={t[c.status]} />
//         </div>
//         <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
//           {[
//             [t.company, c.company || "—"],
//             [t.country, fmt.region(c.country)],
//             [t.orders, fmt.nf.format(c.orders)],
//             [t.spent, fmt.money.format(c.spent)],
//             [t.joined, fmt.date.format(new Date(c.joined))],
//             [t.phone, c.phone ? <Ltr>{c.phone}</Ltr> : "—"],
//           ].map(([key, value]) => (
//             <div key={key} className="min-w-0">
//               <dt className={`text-xs ${muted}`}>{key}</dt>
//               <dd className="truncate font-medium">{value}</dd>
//             </div>
//           ))}
//         </dl>
//         <div className="mt-4 flex gap-2">
//           <button type="button" onClick={() => onEdit(c)} aria-label={t.editNamed(c.name)} className={`${button.base} ${button.secondary} flex-1`}>
//             <Icon name="edit" size={15} />{t.edit}
//           </button>
//           <button type="button" onClick={() => onDelete(c)} aria-label={t.deleteNamed(c.name)} className={`${button.base} ${button.dangerGhost} flex-1`}>
//             <Icon name="trash" size={15} />{t.delete}
//           </button>
//         </div>
//       </div>
//     );

//     return { columns, renderCard };
//   }, [t, fmt, onEdit, onDelete]);
// }