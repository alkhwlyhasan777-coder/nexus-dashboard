import { useMemo } from "react";
import "../../components/ui/motion.css";
import ChartCanvas from "../../components/ui/ChartCanvas";
import StatCard from "../../components/ui/StatCard";
import { LANGS } from "../../components/ui/Sidebar";
import { card, chartColors, muted } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import useDarkMode from "../../hooks/useDarkMode";
import { makeFormatters } from "../../lib/format";
import useCustomers from "../Customers/useCustomers";
import { useDealsCtx } from "../Deals/DealsLayout";
import { STAGE_COLOR } from "../Deals/deals.data";
import useLeads from "../Leads/useLeads";
import { STATUS_TONE } from "../Leads/leads.data";
import useTasks from "../Tasks/useTasks";
import { buildAnalytics } from "./analytics.data";
import { T } from "./analytics.i18n";

const LEAD_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4", "#10b981", "#ef4444"];
const TASK_COLORS = ["#94a3b8", "#3b82f6", "#10b981"];

function ChartCard({ title, hint, children, delay = 0, className = "" }) {
  return (
    <section className={`${card} anim-fade-up min-w-0 p-4 ${className}`} style={{ "--delay": `${delay}ms` }}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className={`mt-1 text-xs ${muted}`}>{hint}</p>
      <div className="mt-4 h-64 min-w-0">{children}</div>
    </section>
  );
}

export default function Analytics() {
  const { lang } = useUI();
  const { locale, dir } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);
  const dark = useDarkMode();
  const { deals } = useDealsCtx();
  const { leads } = useLeads();
  const { customers } = useCustomers();
  const { tasks } = useTasks();
  const report = useMemo(() => buildAnalytics(deals, leads, customers, tasks), [deals, leads, customers, tasks]);
  const { totals, months, stageRows, leadRows, taskRows } = report;
  const rtl = dir === "rtl";
  const tick = dark ? "#a3a3a3" : "#737373";
  const grid = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  const axisOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom", rtl, textDirection: rtl ? "rtl" : "ltr", labels: { color: tick, usePointStyle: true, boxWidth: 8, padding: 18 } },
      tooltip: { rtl, textDirection: rtl ? "rtl" : "ltr", padding: 10, cornerRadius: 8 },
    },
    scales: {
      x: { reverse: rtl, grid: { display: false }, border: { display: false }, ticks: { color: tick } },
      y: { beginAtZero: true, position: rtl ? "right" : "left", border: { display: false }, grid: { color: grid }, ticks: { color: tick } },
    },
  }), [rtl, tick, grid]);
  const doughnutOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false, cutout: "68%",
    plugins: {
      legend: { position: "bottom", rtl, textDirection: rtl ? "rtl" : "ltr", labels: { color: tick, usePointStyle: true, boxWidth: 8, padding: 16 } },
      tooltip: { rtl, textDirection: rtl ? "rtl" : "ltr", padding: 10, cornerRadius: 8 },
    },
  }), [rtl, tick]);

  const trendData = useMemo(() => ({
    labels: months.map((month) => fmt.month.format(month.date)),
    datasets: [
      { type: "bar", label: t.wonSeries, data: months.map((month) => month.revenue), backgroundColor: chartColors.primarySoft, borderColor: chartColors.primary, borderWidth: 1, borderRadius: 5, yAxisID: "y" },
      { type: "line", label: t.leadSeries, data: months.map((month) => month.leads), borderColor: chartColors.positive, backgroundColor: chartColors.positive, tension: 0.35, pointRadius: 3, pointHoverRadius: 5, yAxisID: "y1" },
    ],
  }), [months, fmt, t]);
  const trendOptions = useMemo(() => ({
    ...axisOptions,
    scales: {
      ...axisOptions.scales,
      y: { ...axisOptions.scales.y, ticks: { ...axisOptions.scales.y.ticks, callback: (value) => fmt.money.format(value) } },
      y1: { beginAtZero: true, position: rtl ? "left" : "right", grid: { drawOnChartArea: false }, border: { display: false }, ticks: { color: tick, precision: 0 } },
    },
  }), [axisOptions, fmt, rtl, tick]);

  const stageData = useMemo(() => ({
    labels: stageRows.map((row) => t.stages[row.stage]),
    datasets: [{ label: t.deals, data: stageRows.map((row) => row.count), backgroundColor: stageRows.map((row) => STAGE_COLOR[row.stage]), borderRadius: 6, maxBarThickness: 38 }],
  }), [stageRows, t]);
  const leadData = useMemo(() => ({
    labels: leadRows.map((row) => t.leadStatuses[row.status]),
    datasets: [{ data: leadRows.map((row) => row.count), backgroundColor: LEAD_COLORS, borderWidth: 0, hoverOffset: 5 }],
  }), [leadRows, t]);
  const taskData = useMemo(() => ({
    labels: taskRows.map((row) => t.taskStatuses[row.status]),
    datasets: [{ data: taskRows.map((row) => row.count), backgroundColor: TASK_COLORS, borderWidth: 0, hoverOffset: 5 }],
  }), [taskRows, t]);

  return (
    <div className="space-y-6">
      <header className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className={`mt-1 text-sm ${muted}`}>{t.subtitle}</p>
        </div>
        <p className={`text-xs ${muted}`}>{t.sampleNote}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} icon="revenue" label={t.pipeline} value={totals.pipelineValue} format={(v) => fmt.money.format(Math.round(v))} caption={t.pipelineHint(fmt.nf.format(totals.openDeals))}/>
        <StatCard index={1} icon="forecast" label={t.weighted} value={totals.weightedPipeline} format={(v) => fmt.money.format(Math.round(v))} caption={t.weightedHint}/>
        <StatCard index={2} icon="deals" label={t.wonRevenue} value={totals.wonRevenue} format={(v) => fmt.money.format(Math.round(v))} caption={t.wonHint(fmt.nf.format(totals.won), fmt.nf.format(totals.lost))}/>
        <StatCard index={3} icon="analytics" label={t.winRate} value={totals.winRate * 100} format={(v) => fmt.percent.format(v / 100)} caption={t.winHint}/>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={4} icon="customers" label={t.customers} value={totals.customers} format={fmt.nf.format} caption={t.customerHint}/>
        <StatCard index={5} icon="leads" label={t.activeLeads} value={totals.activeLeads} format={fmt.nf.format} caption={t.activeLeadHint}/>
        <StatCard index={6} icon="tasks" label={t.completedTasks} value={totals.completedTasks} format={fmt.nf.format} caption={t.taskHintValue(fmt.nf.format(totals.completedTasks), fmt.nf.format(totals.tasks))}/>
        <StatCard index={7} icon="calendar" label={t.overdueTasks} value={totals.overdueTasks} format={fmt.nf.format} caption={t.overdueHint}/>
      </section>

      <ChartCard title={t.salesTrend} hint={t.salesTrendHint} delay={180}>
        <ChartCanvas type="bar" data={trendData} options={trendOptions} label={t.chartRevenueAlt}/>
      </ChartCard>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title={t.stageTitle} hint={t.stageHint} delay={240}>
          <ChartCanvas type="bar" data={stageData} options={axisOptions} label={t.chartStageAlt}/>
        </ChartCard>
        <ChartCard title={t.leadTitle} hint={t.leadHint} delay={300}>
          <ChartCanvas type="doughnut" data={leadData} options={doughnutOptions} label={t.chartLeadAlt}/>
        </ChartCard>
        <ChartCard title={t.taskTitle} hint={t.taskHint} delay={360} className="xl:col-span-2">
          <div className="mx-auto max-w-xl"><ChartCanvas type="doughnut" data={taskData} options={doughnutOptions} label={t.chartTaskAlt}/></div>
        </ChartCard>
      </section>
    </div>
  );
}
