import { useMemo } from "react";
import { Link } from "react-router-dom";
import ChartCanvas from "../../components/ui/ChartCanvas";
import Icon from "../../components/layout/navbar/Icon";
import StatCard from "../../components/ui/StatCard";
import { LANGS } from "../../components/ui/Sidebar";
import { card, chartColors, hairline, muted } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import useDarkMode from "../../hooks/useDarkMode";
import { makeFormatters } from "../../lib/format";
import useCustomers from "../Customers/useCustomers";
import { isOpen, OPEN_STAGES, PROBABILITY, STAGE_COLOR } from "../Deals/deals.data";
import useDeals from "../Deals/useDeals";
import useLeads from "../Leads/useLeads";
import { isTaskOverdue } from "../Tasks/tasks.data";
import useTasks from "../Tasks/useTasks";
import { buildRevenue } from "../Revenue/revenue.data";
import { T } from "./dashboard.i18n";

const DAY = 86400000;
const MODULES = [
  ["leads", "/leads", "leads"], ["deals", "/deals", "deals"],
  ["customers", "/customers", "customers"], ["pipeline", "/pipeline", "pipeline"],
  ["tasks", "/tasks", "tasks"], ["analytics", "/analytics", "analytics"],
  ["revenue", "/revenue", "revenue"], ["reports", "/reports", "reports"],
  ["forecast", "/forecast", "forecast"],
];

function Panel({ title, hint, action, children, className = "" }) {
  return <section className={`${card} min-w-0 overflow-hidden ${className}`}>
    <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
      <div className="min-w-0"><h2 className="text-sm font-semibold">{title}</h2>{hint && <p className={`mt-1 text-xs leading-relaxed ${muted}`}>{hint}</p>}</div>
      {action}
    </div>
    {children}
  </section>;
}

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Dashboard() {
  const { lang } = useUI();
  const { locale, dir } = LANGS[lang];
  const t = T[lang] || T.en;
  const fmt = useMemo(() => makeFormatters(locale), [locale]);
  const dark = useDarkMode();
  const { leads } = useLeads();
  const { deals } = useDeals();
  const { customers } = useCustomers();
  const { tasks } = useTasks();
  const today = localToday();
  const rtl = dir === "rtl";

  const metrics = useMemo(() => {
    const openDeals = deals.filter(isOpen);
    const wonDeals = deals.filter((deal) => deal.stage === "won");
    const lostDeals = deals.filter((deal) => deal.stage === "lost");
    const closed = wonDeals.length + lostDeals.length;
    const pipelineValue = openDeals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
    const weightedValue = openDeals.reduce((sum, deal) => sum + (Number(deal.value) || 0) * (PROBABILITY[deal.stage] || 0), 0);
    const recentLeads = leads.filter((lead) => Date.now() - new Date(lead.createdAt).getTime() <= 7 * DAY).length;
    const activeCustomers = customers.filter((customer) => customer.status === "active").length;
    const overdueTasks = tasks.filter((task) => isTaskOverdue(task, today)).length;
    const completedTasks = tasks.filter((task) => task.status === "completed").length;
    const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
    const todoTasks = tasks.filter((task) => task.status === "todo").length;
    const resolve = (deal) => {
      const list = deal.clientType === "lead" ? leads : customers;
      const client = list.find((item) => item.id === deal.clientId);
      return client ? { ...client, type: deal.clientType, missing: false } : { id: deal.clientId, type: deal.clientType, name: deal.clientName || "—", missing: true };
    };
    const revenue = buildRevenue(deals, resolve);
    return {
      openDeals, wonDeals, lostDeals, closed, pipelineValue, weightedValue,
      recentLeads, activeCustomers, overdueTasks, completedTasks, inProgressTasks, todoTasks, revenue,
      winRate: closed ? wonDeals.length / closed : 0,
    };
  }, [deals, leads, customers, tasks, today]);

  const stageRows = useMemo(() => OPEN_STAGES.map((stage) => {
    const items = metrics.openDeals.filter((deal) => deal.stage === stage);
    return { stage, count: items.length, value: items.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0) };
  }), [metrics.openDeals]);

  const revenueChart = useMemo(() => ({
    labels: metrics.revenue.months.map((item) => fmt.month.format(item.date)),
    datasets: [{
      label: t.revenue, data: metrics.revenue.months.map((item) => item.value),
      borderColor: chartColors.primary, backgroundColor: chartColors.primarySoft,
      fill: true, tension: 0.35, borderWidth: 2, pointRadius: 3, pointHoverRadius: 5,
    }],
  }), [metrics.revenue.months, fmt, t.revenue]);

  const tick = dark ? "#a3a3a3" : "#737373";
  const grid = dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)";
  const revenueOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { rtl, textDirection: rtl ? "rtl" : "ltr", callbacks: { label: (ctx) => fmt.money.format(ctx.raw) } } },
    scales: {
      x: { reverse: rtl, grid: { display: false }, border: { display: false }, ticks: { color: tick, maxRotation: 0 } },
      y: { beginAtZero: true, position: rtl ? "right" : "left", border: { display: false }, grid: { color: grid }, ticks: { color: tick, callback: (value) => fmt.money.format(value) } },
    },
  }), [rtl, fmt, tick, grid]);

  const maxStage = Math.max(1, ...stageRows.map((row) => row.value));
  const upcomingTasks = useMemo(() => tasks
    .filter((task) => task.status !== "completed" && task.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5), [tasks]);
  const recentLeads = useMemo(() => [...leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5), [leads]);

  const dueLabel = (date) => {
    if (date < today) return t.overdue;
    if (date === today) return t.dueToday;
    const days = Math.ceil((new Date(`${date}T00:00:00`) - new Date(`${today}T00:00:00`)) / DAY);
    return t.dueIn(days);
  };
  const dueTone = (date) => date < today
    ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
    : date === today
      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[.16em] text-blue-600 dark:text-blue-400"><span className="size-2 rounded-full bg-emerald-500"/>{t.eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>
        <p className={`mt-1 max-w-2xl text-sm leading-6 ${muted}`}>{t.subtitle}</p>
      </div>
      <div className={`rounded-xl border px-3 py-2 text-end ${hairline} bg-white/70 dark:bg-neutral-900/70`}>
        <p className={`text-[11px] ${muted}`}>{t.today}</p>
        <p className="mt-0.5 text-sm font-semibold">{fmt.date.format(new Date())}</p>
      </div>
    </header>

    <section aria-label={t.performance} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard index={0} icon="leads" label={t.leads} value={leads.length} format={fmt.nf.format} caption={`${fmt.nf.format(metrics.recentLeads)} · ${t.last7}`}/>
      <StatCard index={1} icon="customers" label={t.customers} value={customers.length} format={fmt.nf.format} caption={`${fmt.nf.format(metrics.activeCustomers)} · ${t.activeCustomers}`}/>
      <StatCard index={2} icon="deals" label={t.openDeals} value={metrics.openDeals.length} format={fmt.nf.format} caption={`${t.weighted}: ${fmt.money.format(metrics.weightedValue)}`}/>
      <StatCard index={3} icon="pipeline" label={t.pipeline} value={metrics.pipelineValue} format={fmt.money.format} caption={`${fmt.nf.format(metrics.openDeals.length)} · ${t.openDeals}`}/>
      <StatCard index={4} icon="revenue" label={t.revenue} value={metrics.revenue.total} format={fmt.money.format} caption={`${fmt.nf.format(metrics.revenue.count)} · ${t.wonDeals}`}/>
      <StatCard index={5} icon="tasks" label={t.overdueTasks} value={metrics.overdueTasks} format={fmt.nf.format} caption={`${fmt.nf.format(metrics.todoTasks + metrics.inProgressTasks)} · ${t.attention}`}/>
    </section>

    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]">
      <Panel title={t.revenueTrend} hint={t.revenueHint}>
        <div className="h-64 px-3 pb-4 pt-5 sm:px-5"><ChartCanvas type="line" data={revenueChart} options={revenueOptions} label={t.revenueHint}/></div>
      </Panel>
      <Panel title={t.pipelineStages} hint={t.stageHint} action={<Link to="/pipeline" className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">{t.viewAll}</Link>}>
        <div className="space-y-5 px-4 pb-5 pt-5 sm:px-5">
          {stageRows.map((row) => <div key={row.stage} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs"><span className="font-medium">{t.stages[row.stage]}</span><span className={`${muted} tabular-nums`}>{fmt.nf.format(row.count)} · {fmt.money.format(row.value)}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"><div className="h-full rounded-full transition-all" style={{ width: `${row.value / maxStage * 100}%`, backgroundColor: STAGE_COLOR[row.stage] }}/></div>
          </div>)}
          {!metrics.openDeals.length && <p className={`py-5 text-center text-sm ${muted}`}>{t.noDeals}</p>}
          <div className={`flex items-center justify-between border-t pt-4 text-xs ${hairline}`}><span className={muted}>{t.weighted}</span><strong className="tabular-nums">{fmt.money.format(metrics.weightedValue)}</strong></div>
        </div>
      </Panel>
    </section>

    <section className="grid gap-4 xl:grid-cols-2">
      <Panel title={t.tasks} hint={t.tasksHint} action={<Link to="/tasks" className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">{t.viewAll}</Link>}>
        <div className="grid grid-cols-3 gap-2 px-4 pt-5 sm:px-5">
          {[[t.pending, metrics.todoTasks, "text-blue-600"], [t.inProgress, metrics.inProgressTasks, "text-amber-600"], [t.completed, metrics.completedTasks, "text-emerald-600"]].map(([label, value, color]) => <div key={label} className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/70"><p className={`text-xl font-semibold tabular-nums ${color}`}>{fmt.nf.format(value)}</p><p className={`mt-1 text-[11px] ${muted}`}>{label}</p></div>)}
        </div>
        <div className="px-4 pb-4 pt-3 sm:px-5">
          <div className={`mb-3 flex h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800`}>
            <span className="bg-blue-500" style={{ width: `${tasks.length ? metrics.todoTasks / tasks.length * 100 : 0}%` }}/>
            <span className="bg-amber-500" style={{ width: `${tasks.length ? metrics.inProgressTasks / tasks.length * 100 : 0}%` }}/>
            <span className="bg-emerald-500" style={{ width: `${tasks.length ? metrics.completedTasks / tasks.length * 100 : 0}%` }}/>
          </div>
          <p className={`text-xs ${muted}`}>{fmt.nf.format(tasks.length)} · {t.totalTasks}</p>
        </div>
      </Panel>
      <Panel title={t.upcoming} hint={t.upcomingHint} action={<Link to="/tasks" className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">{t.viewAll}</Link>}>
        {upcomingTasks.length ? <ul className="divide-y px-4 dark:divide-neutral-800 sm:px-5">
          {upcomingTasks.map((task) => <li key={task.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0"><p className="truncate text-sm font-medium">{task.title}</p><p className={`mt-1 text-[11px] ${muted}`}>{fmt.date.format(new Date(`${task.dueDate}T00:00:00`))}</p></div>
            <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold ${dueTone(task.dueDate)}`}>{dueLabel(task.dueDate)}</span>
          </li>)}
        </ul> : <p className={`px-5 py-9 text-center text-sm ${muted}`}>{t.noTasks}</p>}
      </Panel>
    </section>

    <Panel title={t.recentLeads} hint={t.recentLeadsHint} action={<Link to="/leads" className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">{t.viewAll}</Link>}>
      {recentLeads.length ? <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm"><thead><tr className={`border-y text-xs ${hairline} ${muted}`}><th className="px-5 py-3 text-start font-medium">{lang === "ar" ? "الاسم" : "Lead"}</th><th className="px-5 py-3 text-start font-medium">{lang === "ar" ? "الشركة" : "Company"}</th><th className="px-5 py-3 text-start font-medium">{lang === "ar" ? "الحالة" : "Status"}</th><th className="px-5 py-3 text-end font-medium">{lang === "ar" ? "القيمة" : "Value"}</th></tr></thead>
          <tbody>{recentLeads.map((lead) => <tr key={lead.id} className={`border-b last:border-0 ${hairline}`}><td className="px-5 py-3"><Link to={`/leads/${lead.id}`} className="font-medium hover:text-blue-600">{lead.name}</Link><p className={`mt-0.5 text-[11px] ${muted}`}>{lead.email}</p></td><td className={`px-5 py-3 ${muted}`}>{lead.company || "—"}</td><td className="px-5 py-3"><span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] dark:bg-neutral-800">{lead.status}</span></td><td className="px-5 py-3 text-end font-medium tabular-nums">{fmt.money.format(Number(lead.value) || 0)}</td></tr>)}</tbody>
        </table>
      </div> : <p className={`px-5 py-8 text-center text-sm ${muted}`}>{t.noLeads}</p>}
    </Panel>

    <Panel title={t.quickAccess} hint={t.quickHint}>
      <div className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
        {MODULES.map(([id, path, icon]) => {
          const [title, description] = t.modules[id];
          return <Link key={id} to={path} className="group flex min-w-0 items-center gap-3 rounded-xl border border-neutral-200 p-3 transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-neutral-800 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:bg-blue-500/15 dark:group-hover:text-blue-300"><Icon name={icon} size={18}/></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{title}</span><span className={`mt-0.5 block text-[11px] leading-5 ${muted}`}>{description}</span></span>
            <Icon name={rtl ? "arrow-left" : "arrow-right"} size={15} className={`shrink-0 text-neutral-400 transition group-hover:text-blue-600 ${rtl ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}/>
          </Link>;
        })}
      </div>
    </Panel>
  </div>;
}
