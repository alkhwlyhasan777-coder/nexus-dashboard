import { useMemo } from "react";
import "../../components/ui/motion.css";
import ChartCanvas from "../../components/ui/ChartCanvas";
import StatCard from "../../components/ui/StatCard";
import { card, chartColors, muted } from "../../components/ui/tokens";
import useDarkMode from "../../hooks/useDarkMode";
import { forecastByMonth, OPEN_STAGES, pipelineByStage, STAGE_COLOR } from "./deals.data";

function ChartCard({ title, hint, delay = 0, children }) {
  return (
    <section className={`${card} anim-fade-up p-4`} style={{ "--delay": `${delay}ms` }}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className={`text-xs ${muted}`}>{hint}</p>
      <div className="mt-4 h-60">{children}</div>
    </section>
  );
}

export default function DealStats({ deals, stats, today, fmt, t, dir }) {
  const dark = useDarkMode();
  const rtl = dir === "rtl";
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const options = useMemo(() => {
    const tick = dark ? "#a3a3a3" : "#737373";
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: reduce ? 0 : 900, easing: "easeOutQuart" },
      plugins: {
        legend: { position: "bottom", rtl, textDirection: rtl ? "rtl" : "ltr", labels: { color: tick, usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          rtl, textDirection: rtl ? "rtl" : "ltr", padding: 10, cornerRadius: 8,
          callbacks: { label: (c) => `${c.dataset.label}: ${fmt.money.format(c.parsed.y)}` },
        },
      },
      scales: {
        x: { reverse: rtl, grid: { display: false }, border: { display: false }, ticks: { color: tick } },
        y: {
          position: rtl ? "right" : "left", beginAtZero: true, border: { display: false },
          grid: { color: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" },
          ticks: {
            color: tick,
            callback: (v) => fmt.money.format(v),
          },
        },
      },
    };
  }, [dark, rtl, reduce, fmt]);

  const stageData = useMemo(() => {
    const rows = pipelineByStage(deals);
    return {
      labels: OPEN_STAGES.map((s) => t[`st_${s}`]),
      datasets: [
        { label: t.total, data: rows.map((r) => r.total), backgroundColor: chartColors.primary, borderRadius: 6, maxBarThickness: 36 },
        { label: t.weighted, data: rows.map((r) => Math.round(r.weighted)), backgroundColor: chartColors.positive, borderRadius: 6, maxBarThickness: 36 },
      ],
    };
  }, [deals, t]);

  const monthData = useMemo(() => {
    const buckets = forecastByMonth(deals, today, 6);
    return {
      labels: buckets.map((b) => (b.key === "overdue" ? t.overdueLabel : fmt.month.format(b.date))),
      datasets: [{
        label: t.valueLabel,
        data: buckets.map((b) => b.total),
        backgroundColor: buckets.map((b) => (b.key === "overdue" ? STAGE_COLOR.lost : chartColors.primary)),
        borderRadius: 6, maxBarThickness: 40,
      }],
    };
  }, [deals, today, fmt, t]);

  const monthOptions = useMemo(() => ({ ...options, plugins: { ...options.plugins, legend: { display: false } } }), [options]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0} icon="revenue" label={t.statPipeline} value={stats.pipeline}
          format={(v) => fmt.money.format(Math.round(v))}
          caption={t.openDeals(fmt.nf.format(stats.openCount), fmt.money.format(Math.round(stats.avgOpen)))}
        />
        <StatCard
          index={1} icon="forecast" label={t.statWeighted} value={stats.weighted}
          format={(v) => fmt.money.format(Math.round(v))} caption={t.weightedHint}
        />
        <StatCard
          index={2} icon="tasks" label={t.statWinRate} value={stats.winRate * 100}
          format={(v) => fmt.percent.format(Math.round(v) / 100)}
          caption={t.wonLost(fmt.nf.format(stats.won), fmt.nf.format(stats.lost))}
        />
        <StatCard
          index={3} icon="calendar" label={t.statClosing} value={stats.closingCount}
          format={(v) => fmt.nf.format(Math.round(v))}
          caption={(
            <>
              {t.closingValue(fmt.money.format(stats.closingValue))} ·{" "}
              <span className={stats.overdue ? "font-medium text-red-600 dark:text-red-400" : ""}>
                {stats.overdue ? t.overdueCount(fmt.nf.format(stats.overdue)) : t.nothingOverdue}
              </span>
            </>
          )}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={t.chartStage} hint={t.chartStageHint} delay={160}>
          <ChartCanvas type="bar" data={stageData} options={options} label={t.stageChartAlt} />
        </ChartCard>
        <ChartCard title={t.chartMonth} hint={t.chartMonthHint} delay={240}>
          <ChartCanvas type="bar" data={monthData} options={monthOptions} label={t.monthChartAlt} />
        </ChartCard>
      </div>
    </div>
  );
}