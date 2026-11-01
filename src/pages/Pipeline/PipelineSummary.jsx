import "../../components/ui/motion.css";
import { card, muted } from "../../components/ui/tokens";
import { STAGE_COLOR } from "../Deals/deals.data";

/*
  Numbers and a proportional bar for the open stages. Both are calculated from the deals passed in,
  so they move on their own whenever a card is dragged or edited (the bar segments animate).
  stages: [{ stage, count, total, weighted }]
*/
export default function PipelineSummary({ stats, stages, fmt, t }) {
  const total = stages.reduce((sum, s) => sum + s.total, 0);
  const metrics = [
    [t.summaryOpen, fmt.money.format(Math.round(stats.pipeline)), ""],
    [t.statWeighted, fmt.money.format(Math.round(stats.weighted)), ""],
    [t.summaryDeals, fmt.nf.format(stats.openCount), ""],
    [t.summaryOverdue, fmt.nf.format(stats.overdue), stats.overdue ? "text-red-600 dark:text-red-400" : ""],
  ];

  return (
    <section aria-label={t.funnelLabel} className={`${card} anim-fade-up p-4`}>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map(([label, value, tone]) => (
          <div key={label} className="min-w-0">
            <dt className={`text-xs ${muted}`}>{label}</dt>
            <dd className={`mt-0.5 truncate text-xl font-semibold tabular-nums ${tone}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <div aria-hidden="true" className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        {total > 0 && stages.map((s) => (
          <span
            key={s.stage}
            className="h-full transition-[flex-grow] duration-700 ease-out motion-reduce:transition-none"
            style={{ flexGrow: s.total, flexBasis: 0, backgroundColor: STAGE_COLOR[s.stage] }}
          />
        ))}
      </div>

      {total === 0 ? (
        <p className={`mt-3 text-xs ${muted}`}>{t.funnelEmpty}</p>
      ) : (
        <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((s) => (
            <li key={s.stage} className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: STAGE_COLOR[s.stage] }} />
              <span className="truncate font-medium">{t[`st_${s.stage}`]}</span>
              <span className={`ms-auto shrink-0 tabular-nums ${muted}`}>{fmt.nf.format(s.count)} · {fmt.money.format(s.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}