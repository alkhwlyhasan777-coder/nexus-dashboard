import { useMemo } from "react";
import "../../components/ui/motion.css";
import Icon from "../../components/layout/navbar/Icon";
import Ring from "../../components/ui/Ring";
import Sparkline from "../../components/ui/Sparkline";
import { accent, card, muted } from "../../components/ui/tokens";
import useCountUp from "../../hooks/useCountUp";
import { monthlySeries } from "./customers.data";

function Kpi({ index, icon, label, value, format, caption, delta, visual }) {
  const animated = useCountUp(value);
  return (
    <div className={`${card} anim-fade-up p-4`} style={{ "--delay": `${index * 80}ms` }}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm ${muted}`}>{label}</p>
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${accent.soft}`}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="truncate text-2xl font-semibold tabular-nums">{format(animated)}</p>
        <span className={`shrink-0 ${accent.text}`}>{visual}</span>
      </div>
      <p className={`mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${muted}`}>
        {delta && (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium ${delta.value >= 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"}`}>
            <Icon name={delta.value >= 0 ? "arrowUp" : "arrowDown"} size={11} strokeWidth={2.2} />
            {delta.text}
          </span>
        )}
        <span>{caption}</span>
      </p>
    </div>
  );
}

export default function KpiCards({ stats, customers, fmt, t }) {
  const series = useMemo(() => monthlySeries(customers, 12), [customers]);
  const int = (v) => fmt.nf.format(Math.round(v));

  const items = [
    { icon: "customers", label: t.kpiTotal, value: stats.total, format: int, caption: t.activeCount(fmt.nf.format(stats.active)), visual: <Sparkline values={series.cumulative} /> },
    { icon: "tasks", label: t.kpiActiveRate, value: stats.activeRate * 100, format: (v) => fmt.percent.format(Math.round(v) / 100), caption: `${fmt.nf.format(stats.active)} / ${fmt.nf.format(stats.total)}`, visual: <Ring value={stats.activeRate} /> },
    {
      icon: "leads", label: t.kpiNew, value: stats.last30, format: int, caption: t.vsPrev,
      delta: { value: stats.trend, text: `${stats.trend > 0 ? "+" : ""}${fmt.percent.format(stats.trend / 100)}` },
      visual: <Sparkline variant="bars" values={series.counts.slice(-6)} />,
    },
    { icon: "revenue", label: t.kpiRevenue, value: stats.revenue, format: (v) => fmt.money.format(Math.round(v)), caption: t.perCustomer(fmt.money.format(Math.round(stats.avg))), visual: <Sparkline values={series.revenue} /> },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => <Kpi key={item.label} index={i} {...item} />)}
    </div>
  );
}
// import "../../components/ui/motion.css";
// import Icon from "../../components/layout/navbar/Icon";
// import useCountUp from "../../hooks/useCountUp";
// import { accent, card, muted } from "../../components/ui/tokens";

// function Kpi({ index, icon, label, value, format, caption, delta }) {
//   const animated = useCountUp(value);
//   return (
//     <div className={`${card} anim-fade-up p-4`} style={{ "--delay": `${index * 80}ms` }}>
//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <p className={`text-sm ${muted}`}>{label}</p>
//           <p className="mt-1 truncate text-2xl font-semibold tabular-nums">{format(animated)}</p>
//         </div>
//         <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${accent.soft}`}>
//           <Icon name={icon} size={18} />
//         </span>
//       </div>
//       <p className={`mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${muted}`}>
//         {delta && (
//           <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium ${delta.value >= 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"}`}>
//             <Icon name={delta.value >= 0 ? "arrowUp" : "arrowDown"} size={11} strokeWidth={2.2} />
//             {delta.text}
//           </span>
//         )}
//         <span>{caption}</span>
//       </p>
//     </div>
//   );
// }

// export default function KpiCards({ stats, fmt, t }) {
//   const items = [
//     { icon: "customers", label: t.kpiTotal, value: stats.total, format: (v) => fmt.nf.format(Math.round(v)), caption: t.activeCount(fmt.nf.format(stats.active)) },
//     { icon: "tasks", label: t.kpiActiveRate, value: stats.activeRate * 100, format: (v) => fmt.percent.format(Math.round(v) / 100), caption: `${fmt.nf.format(stats.active)} / ${fmt.nf.format(stats.total)}` },
//     {
//       icon: "leads", label: t.kpiNew, value: stats.last30, format: (v) => fmt.nf.format(Math.round(v)), caption: t.vsPrev,
//       delta: { value: stats.trend, text: `${stats.trend > 0 ? "+" : ""}${fmt.percent.format(stats.trend / 100)}` },
//     },
//     { icon: "revenue", label: t.kpiRevenue, value: stats.revenue, format: (v) => fmt.money.format(Math.round(v)), caption: t.perCustomer(fmt.money.format(Math.round(stats.avg))) },
//   ];


//   return (
//     <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//       {items.map((item, i) => <Kpi key={item.label} index={i} {...item} />)}
//     </div>
//   );
// }