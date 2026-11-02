import { useMemo, useState } from "react";
import "../../components/ui/motion.css";
import DataTable from "../../components/ui/DataTable";
import ChartCanvas from "../../components/ui/ChartCanvas";
import Icon from "../../components/layout/navbar/Icon";
import Pagination from "../../components/ui/Pagination";
import StatCard from "../../components/ui/StatCard";
import { LANGS } from "../../components/ui/Sidebar";
import { accent, button, card, chartColors, field, hairline, muted, text } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import useDarkMode from "../../hooks/useDarkMode";
import { makeFormatters } from "../../lib/format";
import { useDealsCtx } from "../Deals/DealsLayout";
import { buildRevenue } from "./revenue.data";
import { T } from "./revenue.i18n";

const PAGE_SIZES = [8, 15, 25];
const escapeCsv = (value) => {
  const raw = String(value ?? "");
  return /[",\\n\\r]/.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
};

export default function Revenue() {
  const { lang } = useUI();
  const { locale, dir } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);
  const dark = useDarkMode();
  const { deals } = useDealsCtx();
  const report = useMemo(() => buildRevenue(deals), [deals]);
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
      return inPeriod && (!q || `${deal.title} ${deal.clientName}`.toLocaleLowerCase(locale).includes(q));
    }).sort((a, b) => {
      const result = sort.id === "value" ? Number(a.value) - Number(b.value)
        : sort.id === "client" ? (a.clientName || "").localeCompare(b.clientName || "", locale)
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
    const data = [[t.deal, t.client, t.closedAt, t.value], ...rows.map((deal) => [deal.title, deal.clientName, fmt.date.format(deal.revenueDate), deal.value])];
    const csv = data.map((line) => line.map(escapeCsv).join(",")).join("\\r\\n");
    const url = URL.createObjectURL(new Blob(["\\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `revenue-${new Date().toISOString().slice(0,10)}.csv`; link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { id: "deal", header: t.deal, sortable: true, cell: (deal) => <span className="font-medium">{deal.title}</span> },
    { id: "client", header: t.client, sortable: true, min: 560, cell: (deal) => <span className={muted}>{deal.clientName || "—"}</span> },
    { id: "closedAt", header: t.closedAt, sortable: true, min: 700, cell: (deal) => fmt.date.format(deal.revenueDate) },
    { id: "value", header: t.value, sortable: true, align: "end", cell: (deal) => <span className="font-semibold tabular-nums">{fmt.money.format(Number(deal.value || 0))}</span> },
  ];
  const renderCard = (deal) => (
    <div className="space-y-2 p-4">
      <div className="flex items-start justify-between gap-3"><p className="font-semibold">{deal.title}</p><span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{fmt.money.format(Number(deal.value || 0))}</span></div>
      <p className={`text-sm ${muted}`}>{deal.clientName || "—"}</p>
      <p className={`text-xs ${muted}`}>{fmt.date.format(deal.revenueDate)}</p>
    </div>
  );

  const tick = dark ? "#a3a3a3" : "#737373";
  const chartData = useMemo(() => ({
    labels: report.months.map((item) => fmt.month.format(item.date)),
    datasets: [{ label: t.total, data: report.months.map((item) => item.value), backgroundColor: chartColors.primarySoft, borderColor: chartColors.primary, borderWidth: 1.5, borderRadius: 6 }],
  }), [report.months, fmt, t]);
  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { rtl, textDirection: rtl ? "rtl" : "ltr", callbacks: { label: (ctx) => fmt.money.format(ctx.raw) } } },
    scales: {
      x: { reverse: rtl, grid: { display: false }, border: { display: false }, ticks: { color: tick } },
      y: { beginAtZero: true, position: rtl ? "right" : "left", border: { display: false }, grid: { color: dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)" }, ticks: { color: tick, callback: (value) => fmt.money.format(value) } },
    },
  }), [rtl, fmt, tick, dark]);

  return (
    <div className="space-y-6">
      <header className="anim-fade-up">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className={`mt-1 text-sm ${muted}`}>{t.subtitle}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} icon="revenue" label={t.total} value={report.total} format={fmt.money.format} caption={t.totalHint(fmt.nf.format(report.count))}/>
        <StatCard index={1} icon="calendar" label={t.month} value={report.monthTotal} format={fmt.money.format} caption={t.monthHint(fmt.nf.format(report.monthCount))}/>
        <StatCard index={2} icon="analytics" label={t.year} value={report.yearTotal} format={fmt.money.format} caption={t.yearHint}/>
        <StatCard index={3} icon="forecast" label={t.average} value={report.average} format={fmt.money.format} caption={t.averageHint}/>
      </section>

      <section className={`${card} anim-fade-up p-4`}>
        <div><h2 className="text-sm font-semibold">{t.trend}</h2><p className={`mt-1 text-xs ${muted}`}>{t.trendHint}</p></div>
        <div className="mt-4 h-64"><ChartCanvas type="bar" data={chartData} options={chartOptions} label={t.trendHint}/></div>
      </section>

      <section className={`${card} anim-fade-up p-4`}>
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">{t.topClients}</h2><p className={`mt-1 text-xs ${muted}`}>{t.topClientsHint}</p></div><Icon name="customers" size={18} className={muted}/></div>
        {report.clients.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {report.clients.map((client, index) => <div key={client.id} className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="flex items-center justify-between gap-2"><span className={`text-xs ${muted}`}>#{index + 1}</span><span className="text-xs tabular-nums text-emerald-600 dark:text-emerald-400">{fmt.nf.format(client.count)}</span></div>
            <p className="mt-2 truncate text-sm font-medium" title={client.name}>{client.name}</p><p className="mt-1 text-sm font-semibold tabular-nums">{fmt.money.format(client.value)}</p>
          </div>)}
        </div> : <p className={`py-8 text-center text-sm ${muted}`}>{t.empty}</p>}
      </section>

      <section className={`${card} anim-fade-up overflow-hidden`}>
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative lg:w-72"><Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`}/><input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder={t.search} aria-label={t.searchLabel} className={`${field} ps-9`}/></div>
          <div className="flex flex-wrap gap-1.5">
            {[["all",t.allPeriods],["month",t.thisMonth],["year",t.thisYear]].map(([id,label]) => <button key={id} type="button" aria-pressed={period === id} onClick={() => { setPeriod(id); setPage(1); }} className={`rounded-full border px-3 py-1.5 text-sm font-medium ${period === id ? `border-transparent ${accent.soft}` : `${hairline} ${text.body}`}`}>{label}</button>)}
          </div>
          <button type="button" onClick={exportCsv} disabled={!rows.length} className={`${button.base} ${button.secondary} lg:ms-auto`}><Icon name="download" size={15}/>{t.export}</button>
        </div>
        <div className={`border-t ${hairline}`}>
          <div className={`px-4 py-3 text-xs ${muted}`}>{t.registerHint}</div>
          {rows.length ? <>
            <DataTable columns={columns} rows={pageRows} rowKey={(deal) => deal.id} sort={sort} onSort={onSort} renderCard={renderCard} label={t.tableLabel} labels={{ sortBy: t.sortBy, toggleDirection: t.toggleDirection }}/>
            <Pagination page={current} pageCount={pageCount} total={rows.length} pageSize={pageSize} pageSizeOptions={PAGE_SIZES} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} onPage={setPage} format={fmt.nf.format} t={t}/>
          </> : <div className="px-4 py-14 text-center"><p className="font-semibold">{query || period !== "all" ? t.noResults : t.empty}</p><p className={`mt-1 text-sm ${muted}`}>{query || period !== "all" ? t.noResultsHint : t.emptyHint}</p></div>}
        </div>
      </section>
      <p className={`text-xs leading-relaxed ${muted}`}>{t.note}</p>
    </div>
  );
}
