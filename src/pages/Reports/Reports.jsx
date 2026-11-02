import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../components/ui/motion.css";
import ChartCanvas from "../../components/ui/ChartCanvas";
import Icon from "../../components/layout/navbar/Icon";
import StatCard from "../../components/ui/StatCard";
import { LANGS } from "../../components/ui/Sidebar";
import { button, card, chartColors, hairline, muted } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import useDarkMode from "../../hooks/useDarkMode";
import { makeFormatters } from "../../lib/format";
import useCustomers from "../Customers/useCustomers";
import { useDealsCtx } from "../Deals/DealsLayout";
import useLeads from "../Leads/useLeads";
import useTasks from "../Tasks/useTasks";
import { buildReports } from "./reports.data";
import { T } from "./reports.i18n";

function Panel({ title, hint, children, className = "" }) {
  return <section className={`${card} anim-fade-up min-w-0 overflow-hidden ${className}`}>
    <div className="px-4 pt-4 sm:px-5 sm:pt-5"><h2 className="text-sm font-semibold">{title}</h2><p className={`mt-1 text-xs ${muted}`}>{hint}</p></div>
    {children}
  </section>;
}

export default function Reports() {
  const { lang } = useUI();
  const { locale, dir } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);
  const dark = useDarkMode();
  const location = useLocation();
  const isForecast = location.pathname === "/forecast";
  const { deals } = useDealsCtx();
  const { leads } = useLeads();
  const { customers } = useCustomers();
  const { tasks } = useTasks();
  const report = useMemo(() => buildReports(deals, leads, customers, tasks), [deals, leads, customers, tasks]);
  const [period, setPeriod] = useState("12");
  const months = period === "6" ? report.months.slice(-6) : report.months;
  const { totals } = report;
  const rtl = dir === "rtl";
  const tick = dark ? "#a3a3a3" : "#737373";
  const grid = dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)";

  const chartData = useMemo(() => ({
    labels: months.map((item) => fmt.month.format(item.date)),
    datasets: [
      { type: "bar", label: t.wonRevenue, data: months.map((item) => item.won), backgroundColor: chartColors.primarySoft, borderColor: chartColors.primary, borderWidth: 1, borderRadius: 6, maxBarThickness: 34, yAxisID: "y" },
      { type: "line", label: t.weighted, data: months.map((item) => item.pipeline), borderColor: chartColors.positive, backgroundColor: chartColors.positive, tension: .35, pointRadius: 3, yAxisID: "y" },
    ],
  }), [months, fmt, t]);
  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom", rtl, textDirection: rtl ? "rtl" : "ltr", labels: { color: tick, usePointStyle: true, boxWidth: 8, padding: 18 } },
      tooltip: { rtl, textDirection: rtl ? "rtl" : "ltr", padding: 10, cornerRadius: 9, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${fmt.money.format(ctx.raw)}` } },
    },
    scales: {
      x: { reverse: rtl, grid: { display: false }, border: { display: false }, ticks: { color: tick, maxRotation: 0 } },
      y: { beginAtZero: true, position: rtl ? "right" : "left", border: { display: false }, grid: { color: grid }, ticks: { color: tick, callback: (value) => fmt.money.format(value) } },
    },
  }), [rtl, tick, grid, fmt]);

  const exportCsv = () => {
    const rows = [
      [t.tableStage, t.count, t.value],
      ...report.stageRows.map((row) => [t.stages[row.stage] || row.stage, row.count, row.value]),
      [],
      [t.wonRevenue, totals.wonRevenue],
      [t.pipeline, totals.pipeline],
      [t.weighted, totals.weighted],
      [t.winRate, fmt.percent.format(totals.winRate)],
      [],
      [t.forecastTitle, t.conservative, t.expected, t.optimistic],
      ["", report.forecast[0].value, report.forecast[1].value, report.forecast[2].value],
    ];
    const safe = (value) => {
      let text = String(value ?? "");
      if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
      return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
    };
    const csv = rows.map((row) => row.map(safe).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `reports-forecast-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxStage = Math.max(1, ...report.stageRows.map((row) => row.value));
  const scenarios = report.forecast;
  const activity = [
    { label: t.leads, value: totals.leads, icon: "leads" },
    { label: t.customers, value: totals.customers, icon: "customers" },
    { label: t.tasks, value: totals.tasks, icon: "tasks" },
    { label: t.completed, value: totals.completedTasks, icon: "check" },
    { label: t.overdue, value: totals.overdueTasks, icon: "calendar" },
  ];

  return <div className="space-y-6">
    <header className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
      <div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400"><span className="size-2 rounded-full bg-blue-500"/>{isForecast ? t.forecast : t.reports}</div><h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1><p className={`mt-1 text-sm ${muted}`}>{t.subtitle}</p></div>
      <button type="button" onClick={exportCsv} className={`${button.base} ${button.secondary}`}><Icon name="download" size={15}/>{t.export}</button>
    </header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard index={0} icon="revenue" label={t.wonRevenue} value={totals.wonRevenue} format={fmt.money.format} caption={t.wonHint(fmt.nf.format(totals.won))}/>
      <StatCard index={1} icon="deals" label={t.pipeline} value={totals.pipeline} format={fmt.money.format} caption={t.pipelineHint(fmt.nf.format(totals.open))}/>
      <StatCard index={2} icon="forecast" label={t.weighted} value={totals.weighted} format={fmt.money.format} caption={t.weightedHint}/>
      <StatCard index={3} icon="analytics" label={t.winRate} value={totals.winRate * 100} format={(value) => fmt.percent.format(value / 100)} caption={t.winHint(fmt.nf.format(totals.won), fmt.nf.format(totals.lost))}/>
    </section>

    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
      <Panel title={t.trend} hint={t.trendHint} className="p-0">
        <div className="flex flex-wrap items-center justify-end gap-2 px-4 pt-3">
          {[["6", t.sixMonths], ["12", t.twelveMonths]].map(([value, label]) => <button key={value} type="button" aria-pressed={period === value} onClick={() => setPeriod(value)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${period === value ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300" : `${hairline} ${muted}`}`}>{label}</button>)}
        </div>
        <div className="h-72 px-3 pb-4 pt-3 sm:px-5"><ChartCanvas type="bar" data={chartData} options={chartOptions} label={t.chartLabel}/></div>
      </Panel>
      <Panel title={t.forecastTitle} hint={t.forecastHint} className="p-0">
        <div className="space-y-5 px-4 pb-5 pt-5 sm:px-5">
          {scenarios.map((item) => <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{t[item.label]}</span><strong className="text-sm tabular-nums">{fmt.money.format(item.value)}</strong></div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${totals.pipeline ? Math.min(100, item.value / totals.pipeline * 100) : 0}%` }}/></div>
          </div>)}
        </div>
      </Panel>
    </section>

    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,1fr)]">
      <Panel title={t.stage} hint={t.stageHint} className="p-0">
        <div className="overflow-x-auto px-4 pb-4 pt-3 sm:px-5">
          <table className="w-full min-w-[420px] text-sm"><thead><tr className={`border-b text-xs ${hairline} ${muted}`}><th className="py-3 text-start font-medium">{t.tableStage}</th><th className="py-3 text-end font-medium">{t.count}</th><th className="py-3 text-end font-medium">{t.value}</th></tr></thead>
            <tbody>{report.stageRows.map((row) => <tr key={row.stage} className={`border-b last:border-0 ${hairline}`}><td className="py-3"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-blue-500"/><span>{t.stages[row.stage] || row.stage}</span></div></td><td className="py-3 text-end tabular-nums">{fmt.nf.format(row.count)}</td><td className="py-3 text-end font-medium tabular-nums">{fmt.money.format(row.value)}</td></tr>)}</tbody>
          </table>
          {report.stageRows.length === 0 && <p className={`py-8 text-center text-sm ${muted}`}>{t.noData}</p>}
          <div className="mt-4 space-y-3">{report.stageRows.map((row) => <div key={row.stage} className="space-y-1"><div className="flex justify-between gap-3 text-xs"><span>{t.stages[row.stage] || row.stage}</span><span className="tabular-nums">{fmt.money.format(row.value)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${row.value / maxStage * 100}%` }}/></div></div>)}</div>
        </div>
      </Panel>
      <Panel title={t.activity} hint={t.activityHint} className="p-0">
        <div className="divide-y px-4 pb-2 pt-2 sm:px-5">
          {activity.map((item) => <div key={item.label} className={`flex items-center justify-between gap-3 py-3 ${hairline}`}><span className="flex items-center gap-2.5 text-sm"><span className="grid size-8 place-items-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300"><Icon name={item.icon} size={15}/></span>{item.label}</span><strong className="tabular-nums">{fmt.nf.format(item.value)}</strong></div>)}
        </div>
      </Panel>
    </section>
    <p className={`flex items-start gap-2 text-xs leading-relaxed ${muted}`}><Icon name="alert" size={14} className="mt-0.5 shrink-0"/>{t.note}</p>
  </div>;
}
