import { useMemo, useState } from "react";
import "../../components/ui/motion.css";
import DataTable from "../../components/ui/DataTable";
import ChartCanvas from "../../components/ui/ChartCanvas";
import Icon from "../../components/layout/navbar/Icon";
import Pagination from "../../components/ui/Pagination";
import StatCard from "../../components/ui/StatCard";
import { LANGS } from "../../components/ui/Sidebar";
import { button, card, chartColors, field, hairline, muted, text } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import useDarkMode from "../../hooks/useDarkMode";
import { makeFormatters } from "../../lib/format";
import { useDealsCtx } from "../Deals/DealsLayout";
import { buildRevenue } from "./revenue.data";
import { T } from "./revenue.i18n";

const PAGE_SIZES = [8, 15, 25];
const safeCsv = (value) => {
  let raw = String(value ?? "");
  if (/^[=+@\-\t\r]/.test(raw)) raw = `'${raw}`;
  return /[",\n\r]/.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
};

function Panel({ title, hint, children, className = "" }) {
  return (
    <section className={`${card} anim-fade-up min-w-0 overflow-hidden ${className}`}>
      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className={`mt-1 text-xs leading-relaxed ${muted}`}>{hint}</p>
      </div>
      {children}
    </section>
  );
}

export default function Revenue() {
  const { lang } = useUI();
  const { locale, dir } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);
  const dark = useDarkMode();
  const { deals, resolve } = useDealsCtx();
  const report = useMemo(() => buildRevenue(deals, resolve), [deals, resolve]);
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState({ id: "closedAt", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const rtl = dir === "rtl";

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    const now = new Date();
    return report.wonDeals.filter((deal) => {
      const date = deal.revenueDate;
      const inPeriod = period === "all" ||
        (period === "month" && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) ||
        (period === "year" && date.getFullYear() === now.getFullYear());
      const searchable = [deal.title, deal.client.name, deal.client.company, deal.client.email].join(" ").toLocaleLowerCase(locale);
      return inPeriod && (!q || searchable.includes(q));
    }).sort((a, b) => {
      const result = sort.id === "value" ? a.revenueValue - b.revenueValue
        : sort.id === "client" ? a.client.name.localeCompare(b.client.name, locale)
        : sort.id === "deal" ? a.title.localeCompare(b.title, locale)
        : a.revenueDate - b.revenueDate;
      return sort.dir === "asc" ? result : -result;
    });
  }, [report.wonDeals, query, period, locale, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);
  const onSort = (id) => {
    setSort((prev) => prev.id === id ? { id, dir: prev.dir === "asc" ? "desc" : "asc" } : { id, dir: id === "closedAt" ? "desc" : "asc" });
    setPage(1);
  };

  const exportCsv = () => {
    const data = [
      [t.deal, t.client, t.customer, t.closedAt, t.value],
      ...rows.map((deal) => [deal.title, deal.client.name, deal.client.company, fmt.date.format(deal.revenueDate), deal.revenueValue]),
    ];
    const csv = data.map((line) => line.map(safeCsv).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `revenue-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { id: "deal", header: t.deal, sortable: true, cell: (deal) => <div className="min-w-40"><p className="font-medium">{deal.title}</p><p className={`mt-0.5 text-[11px] ${muted}`}>{t.wonDeal}</p></div> },
    { id: "client", header: t.client, sortable: true, min: 560, cell: (deal) => <div className="min-w-36"><p className="font-medium">{deal.client.name}</p><p className={`mt-0.5 text-xs ${muted}`}>{deal.client.company || (deal.client.missing ? t.unavailable : deal.client.type === "lead" ? t.lead : t.customer)}</p></div> },
    { id: "closedAt", header: t.closedAt, sortable: true, min: 700, cell: (deal) => <span className={muted}>{fmt.date.format(deal.revenueDate)}</span> },
    { id: "value", header: t.value, sortable: true, align: "end", cell: (deal) => <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{fmt.money.format(deal.revenueValue)}</span> },
  ];

  const renderCard = (deal) => (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="truncate font-semibold">{deal.title}</p><p className={`mt-1 text-xs ${muted}`}>{deal.client.name}</p></div>
        <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-semibold tabular-nums text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{fmt.money.format(deal.revenueValue)}</span>
      </div>
      <div className={`flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-xs ${hairline} ${muted}`}>
        <span>{deal.client.company || (deal.client.type === "lead" ? t.lead : t.customer)}</span>
        <span>{fmt.date.format(deal.revenueDate)}</span>
      </div>
    </div>
  );

  const tick = dark ? "#a3a3a3" : "#737373";
  const grid = dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)";
  const chartData = useMemo(() => ({
    labels: report.months.map((item) => fmt.month.format(item.date)),
    datasets: [{
      label: t.total,
      data: report.months.map((item) => item.value),
      backgroundColor: report.months.map((item) => item.value ? chartColors.primarySoft : (dark ? "rgba(148,163,184,.12)" : "rgba(148,163,184,.15)")),
      borderColor: chartColors.primary,
      borderWidth: 1.5,
      borderRadius: 7,
      maxBarThickness: 42,
    }],
  }), [report.months, fmt, t, dark]);
  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { rtl, textDirection: rtl ? "rtl" : "ltr", padding: 10, cornerRadius: 9, callbacks: { label: (ctx) => fmt.money.format(ctx.raw) } },
    },
    scales: {
      x: { reverse: rtl, grid: { display: false }, border: { display: false }, ticks: { color: tick, maxRotation: 0 } },
      y: { beginAtZero: true, position: rtl ? "right" : "left", border: { display: false }, grid: { color: grid }, ticks: { color: tick, callback: (value) => fmt.money.format(value) } },
    },
  }), [rtl, fmt, tick, grid]);

  const maxClientValue = report.clients[0]?.value || 1;
  const monthDelta = report.monthChange;
  const linkedPercent = report.count ? Math.round((report.linkedDeals / report.count) * 100) : 0;

  return (
    <div className="space-y-6">
      <header className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400"><span className="size-2 rounded-full bg-blue-500"/>{t.linked}</div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
          <p className={`mt-1 text-sm ${muted}`}>{t.subtitle}</p>
        </div>
        <div className={`rounded-xl border px-3 py-2 ${hairline} bg-white/70 dark:bg-neutral-900/70`}>
          <p className={`text-[11px] ${muted}`}>{t.linked}</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">{fmt.percent.format(linkedPercent / 100)}</p>
          <p className={`text-[10px] ${muted}`}>{t.linkedHint(fmt.nf.format(report.linkedDeals), fmt.nf.format(report.unlinkedDeals))}</p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} icon="revenue" label={t.total} value={report.total} format={fmt.money.format} caption={t.totalHint(fmt.nf.format(report.count))}/>
        <StatCard index={1} icon="calendar" label={t.month} value={report.monthTotal} format={fmt.money.format} caption={monthDelta === null ? t.noComparison : `${monthDelta >= 0 ? "+" : ""}${fmt.nf.format(Math.round(monthDelta))}% ${t.previousMonth}`}/>
        <StatCard index={2} icon="analytics" label={t.year} value={report.yearTotal} format={fmt.money.format} caption={t.yearHint}/>
        <StatCard index={3} icon="forecast" label={t.average} value={report.average} format={fmt.money.format} caption={t.averageHint}/>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <Panel title={t.trend} hint={t.trendHint} className="p-0">
          <div className="h-72 px-3 pb-4 pt-5 sm:px-5"><ChartCanvas type="bar" data={chartData} options={chartOptions} label={t.trendHint}/></div>
        </Panel>

        <Panel title={t.topClients} hint={t.topClientsHint} className="p-0">
          {report.clients.length ? <div className="space-y-4 px-4 pb-5 pt-5 sm:px-5">
            {report.clients.map((client, index) => (
              <div key={client.key} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{index + 1}</span>
                    <div className="min-w-0"><p className="truncate text-sm font-medium">{client.name}</p><p className={`truncate text-[11px] ${muted}`}>{client.company || (client.type === "lead" ? t.lead : t.customer)}</p></div>
                  </div>
                  <div className="shrink-0 text-end"><p className="text-sm font-semibold tabular-nums">{fmt.money.format(client.value)}</p><p className={`text-[10px] ${muted}`}>{t.deals(fmt.nf.format(client.count))}</p></div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"><div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.max(3, (client.value / maxClientValue) * 100)}%` }}/></div>
              </div>
            ))}
          </div> : <p className={`px-4 py-12 text-center text-sm ${muted}`}>{t.empty}</p>}
        </Panel>
      </section>

      <section className={`${card} anim-fade-up overflow-hidden`}>
        <div className={`flex flex-col gap-3 border-b p-4 sm:px-5 lg:flex-row lg:items-center ${hairline}`}>
          <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">{t.register}</h2><p className={`mt-1 text-xs ${muted}`}>{t.registerHint}</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64"><Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`}/><input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder={t.search} aria-label={t.searchLabel} className={`${field} ps-9`}/></div>
            <button type="button" onClick={exportCsv} disabled={!rows.length} className={`${button.base} ${button.secondary}`}><Icon name="download" size={15}/>{t.export}</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
          {[["all",t.allPeriods],["month",t.thisMonth],["year",t.thisYear]].map(([id,label]) => <button key={id} type="button" aria-pressed={period === id} onClick={() => { setPeriod(id); setPage(1); }} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${period === id ? `border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300` : `${hairline} ${text.body} hover:bg-neutral-50 dark:hover:bg-neutral-800`}`}>{label}</button>)}
          <span className={`ms-auto text-xs ${muted}`}>{t.rows}: {fmt.nf.format(rows.length)}</span>
        </div>
        <div className={`border-t ${hairline}`}>
          {rows.length ? <>
            <DataTable columns={columns} rows={pageRows} rowKey={(deal) => deal.id} sort={sort} onSort={onSort} renderCard={renderCard} label={t.tableLabel} labels={{ sortBy: t.sortBy, toggleDirection: t.toggleDirection }}/>
            <Pagination page={current} pageCount={pageCount} total={rows.length} pageSize={pageSize} pageSizeOptions={PAGE_SIZES} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} onPage={setPage} format={fmt.nf.format} t={t}/>
          </> : <div className="px-4 py-14 text-center"><span className="mx-auto grid size-11 place-items-center rounded-2xl bg-neutral-100 text-neutral-500 dark:bg-neutral-800"><Icon name="search" size={19}/></span><p className="mt-3 font-semibold">{query || period !== "all" ? t.noResults : t.empty}</p><p className={`mt-1 text-sm ${muted}`}>{query || period !== "all" ? t.noResultsHint : t.emptyHint}</p></div>}
        </div>
      </section>

      <p className={`flex items-start gap-2 text-xs leading-relaxed ${muted}`}><Icon name="alert" size={14} className="mt-0.5 shrink-0"/>{t.note}</p>
    </div>
  );
}
