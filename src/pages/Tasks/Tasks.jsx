import { useCallback, useEffect, useMemo, useState } from "react";
import "../../components/ui/motion.css";
import DataTable from "../../components/ui/DataTable";
import Icon from "../../components/layout/navbar/Icon";
import IconButton from "../../components/layout/navbar/IconButton";
import Pagination from "../../components/ui/Pagination";
import { LANGS } from "../../components/ui/Sidebar";
import Toast from "../../components/ui/Toast";
import { accent, button, card, field, hairline, hoverBg, muted, text } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import useToday from "../../hooks/useToday";
import { makeFormatters } from "../../lib/format";
import { getOwner } from "../../lib/team";
import { isTaskOverdue, TASK_PRIORITIES, TASK_STATUSES } from "./tasks.data";
import useTasks from "./useTasks";
import TaskModals from "./TaskModals";
import useTaskTable from "./taskTable";
import { T } from "./tasks.i18n";

const PAGE_SIZES = [8, 15, 25];
const DEFAULT_DIR = { title: "asc", status: "asc", priority: "desc", dueDate: "asc", assignee: "asc" };
const SORTS = Object.keys(DEFAULT_DIR);
const PRIORITY_TONE = { low: "neutral", medium: "blue", high: "amber", urgent: "red" };

function escapeCsv(value) {
  const raw = String(value ?? "");
  return /[",\\n\\r]/.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
}

export default function Tasks() {
  const { lang } = useUI();
  const { locale, dir } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);
  const today = useToday();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sort, setSort] = useState({ id: "dueDate", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    try { const saved = Number(localStorage.getItem("tasks:pageSize")); return PAGE_SIZES.includes(saved) ? saved : 8; } catch { return 8; }
  });
  const [view, setView] = useState(() => {
    try { return localStorage.getItem("tasks:view") === "cards" ? "cards" : "table"; } catch { return "table"; }
  });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, extra = {}) => setToast({ id: Date.now(), message, ...extra }), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const { tasks, status: dataStatus, add, update, remove, restore, acknowledge } = useTasks({
    onExternalChange: () => notify(t.synced),
  });

  useEffect(() => { try { localStorage.setItem("tasks:view", view); } catch { /* storage unavailable */ } }, [view]);
  useEffect(() => { try { localStorage.setItem("tasks:pageSize", String(pageSize)); } catch { /* storage unavailable */ } }, [pageSize]);

  const counts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter((task) => task.status === "todo").length,
    in_progress: tasks.filter((task) => task.status === "in_progress").length,
    completed: tasks.filter((task) => task.status === "completed").length,
    overdue: tasks.filter((task) => isTaskOverdue(task, today)).length,
    urgent: tasks.filter((task) => task.priority === "urgent" && task.status !== "completed").length,
  }), [tasks, today]);

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    const filtered = tasks.filter((task) => {
      const owner = getOwner(task.assigneeId)?.name ?? "";
      const matchesQuery = !q || `${task.title} ${task.description} ${owner}`.toLocaleLowerCase(locale).includes(q);
      return matchesQuery && (statusFilter === "all" || task.status === statusFilter) && (priorityFilter === "all" || task.priority === priorityFilter);
    });
    const compare = {
      title: (a, b) => a.title.localeCompare(b.title, locale),
      status: (a, b) => TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status),
      priority: (a, b) => TASK_PRIORITIES.indexOf(a.priority) - TASK_PRIORITIES.indexOf(b.priority),
      dueDate: (a, b) => (a.dueDate || "9999-99-99").localeCompare(b.dueDate || "9999-99-99"),
      assignee: (a, b) => (getOwner(a.assigneeId)?.name ?? "").localeCompare(getOwner(b.assigneeId)?.name ?? "", locale),
    }[sort.id];
    return filtered.sort((a, b) => (sort.dir === "asc" ? 1 : -1) * compare(a, b));
  }, [tasks, query, statusFilter, priorityFilter, locale, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);
  const filtering = Boolean(query.trim() || statusFilter !== "all" || priorityFilter !== "all");

  const openAdd = useCallback(() => setModal({ type: "add" }), []);
  const openEdit = useCallback((task) => setModal({ type: "edit", task }), []);
  const openDelete = useCallback((task) => setModal({ type: "delete", task }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const onSort = (id) => {
    setSort((currentSort) => currentSort.id === id
      ? { id, dir: currentSort.dir === "asc" ? "desc" : "asc" }
      : { id, dir: DEFAULT_DIR[id] ?? "desc" });
    setPage(1);
  };
  const clearFilters = () => { setQuery(""); setStatusFilter("all"); setPriorityFilter("all"); setPage(1); };
  const handleSave = (values) => {
    if (modal.type === "edit") {
      update({ ...modal.task, ...values });
      notify(t.updated(values.title));
    } else {
      add(values);
      clearFilters();
      setSort({ id: "dueDate", dir: "asc" });
      notify(t.added(values.title));
    }
    closeModal();
  };
  const handleDelete = () => {
    const removed = remove(modal.task.id);
    closeModal();
    if (removed) notify(t.deleted(removed.task.title), {
      actionLabel: t.undo,
      onAction: () => { restore(removed); notify(t.restored(removed.task.title)); },
    });
  };
  const toggleComplete = useCallback((task) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed";
    update({ ...task, status: nextStatus });
    notify(nextStatus === "completed" ? t.completedToast(task.title) : t.reopenedToast(task.title));
  }, [update, notify, t]);

  const { columns, renderCard } = useTaskTable({ t, fmt, query, today, onEdit: openEdit, onDelete: openDelete, onToggle: toggleComplete });
  const filters = [
    { id: "all", label: t.all, count: counts.all },
    { id: "todo", label: t.st_todo, count: counts.todo },
    { id: "in_progress", label: t.st_in_progress, count: counts.in_progress },
    { id: "completed", label: t.st_completed, count: counts.completed },
  ];

  const exportCsv = () => {
    const headers = [t.task, t.description, t.status, t.priority, t.dueDate, t.assignee, t.created];
    const data = rows.map((task) => [
      task.title, task.description, t[`st_${task.status}`], t[`pr_${task.priority}`],
      task.dueDate, getOwner(task.assigneeId)?.name ?? t.noAssignee, task.createdAt,
    ]);
    const csv = [headers, ...data].map((line) => line.map(escapeCsv).join(",")).join("\\r\\n");
    const url = URL.createObjectURL(new Blob(["\\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `tasks-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify(t.exported(fmt.nf.format(rows.length)));
  };

  return (
    <div className="space-y-6">
      <header className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className={`mt-1 text-sm ${muted}`}>{t.subtitle}</p>
        </div>
        <button type="button" onClick={openAdd} className={`${button.base} ${button.primary}`}>
          <Icon name="plus" size={16} strokeWidth={2.2}/>{t.add}
        </button>
      </header>

      {(dataStatus.corrupt || dataStatus.dropped > 0) && (
        <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <p>{dataStatus.corrupt ? t.dataWarning : t.droppedWarning(dataStatus.dropped)}</p>
          <button type="button" onClick={acknowledge} className="mt-1 font-medium underline">{t.dismiss}</button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t.total, value: counts.all, icon: "tasks", hint: t.allTasksHint },
          { label: t.todo, value: counts.todo, icon: "leads", hint: t.waitingTasksHint },
          { label: t.inProgress, value: counts.in_progress, icon: "forecast", hint: t.activeTasksHint },
          { label: t.completed, value: counts.completed, icon: "check", hint: t.completedTasksHint },
        ].map((item, index) => (
          <div key={item.label} className={`${card} anim-fade-up p-4`} style={{ "--delay": `${index * 70}ms` }}>
            <div className="flex items-center justify-between gap-3">
              <p className={`text-sm ${muted}`}>{item.label}</p>
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${accent.soft}`}><Icon name={item.icon} size={16}/></span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{fmt.nf.format(item.value)}</p>
            <p className={`mt-2 text-xs ${muted}`}>{item.hint}</p>
          </div>
        ))}
      </section>

      <section className={`${card} anim-fade-up overflow-hidden`} style={{ "--delay": "240ms" }}>
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative lg:w-72">
            <Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`}/>
            <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder={t.search} aria-label={t.searchLabel} className={`${field} ps-9`}/>
          </div>
          <div role="group" aria-label={t.filterBy} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 lg:flex-1">
            {filters.map((filter) => (
              <button key={filter.id} type="button" aria-pressed={statusFilter === filter.id}
                onClick={() => { setStatusFilter(filter.id); setPage(1); }}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.ring} ${statusFilter === filter.id ? `border-transparent ${accent.soft}` : `${hairline} ${text.body} ${hoverBg}`}`}>
                {filter.label}<span className="text-xs tabular-nums opacity-70">{fmt.nf.format(filter.count)}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:ms-auto">
            <label htmlFor="task-priority-filter" className="sr-only">{t.priority}</label>
            <select id="task-priority-filter" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className={`${field} w-auto min-w-32`}>
              <option value="all">{t.allPriorities}</option>
              {TASK_PRIORITIES.map((priority) => <option key={priority} value={priority}>{t[`pr_${priority}`]}</option>)}
            </select>
            {filtering && <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}><Icon name="x" size={14}/>{t.clear}</button>}
            <button type="button" onClick={exportCsv} disabled={rows.length === 0} className={`${button.base} ${button.secondary}`}><Icon name="download" size={15}/>{t.export}</button>
            <div role="group" aria-label={t.viewLabel} className={`inline-flex rounded-lg border p-0.5 ${hairline}`}>
              {[[ "table", "table", t.viewTable ], [ "cards", "grid", t.viewCards ]].map(([id, icon, label]) => (
                <button key={id} type="button" aria-pressed={view === id} aria-label={label} title={label} onClick={() => setView(id)}
                  className={`grid size-8 place-items-center rounded-md transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.ring} ${view === id ? accent.soft : `${text.body} ${hoverBg}`}`}>
                  <Icon name={icon} size={16}/>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`border-t ${hairline}`}>
          {rows.length === 0 ? (
            <div className={`flex flex-col items-center gap-3 px-4 py-14 text-center`}>
              <span className={`grid size-12 place-items-center rounded-full ${accent.soft}`}><Icon name="tasks" size={22}/></span>
              <div><p className="font-semibold">{filtering ? t.noResults : t.empty}</p><p className={`mt-1 text-sm ${muted}`}>{filtering ? t.noResultsHint : t.emptyHint}</p></div>
              {filtering ? <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>{t.clear}</button> : <button type="button" onClick={openAdd} className={`${button.base} ${button.primary}`}><Icon name="plus" size={16}/>{t.add}</button>}
            </div>
          ) : (
            <>
              <div className={`flex items-center justify-between px-4 py-2 text-xs ${muted}`}><span>{t.resultCount(fmt.nf.format(rows.length), fmt.nf.format(tasks.length))}</span>{counts.overdue > 0 && <span className="font-medium text-red-600 dark:text-red-400">{t.overdue}: {fmt.nf.format(counts.overdue)}</span>}</div>
              <DataTable columns={columns} rows={pageRows} rowKey={(task) => task.id} sort={sort} onSort={onSort}
                renderCard={renderCard} layout={view === "cards" ? "cards" : "auto"} label={t.tableLabel}
                labels={{ sortBy: t.sortBy, toggleDirection: t.toggleDirection }}/>
              <Pagination page={current} pageCount={pageCount} total={rows.length} pageSize={pageSize} pageSizeOptions={PAGE_SIZES}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} onPage={setPage} format={fmt.nf.format} t={t}/>
            </>
          )}
        </div>
      </section>

      <TaskModals modal={modal} t={t} onClose={closeModal} onSave={handleSave} onDelete={handleDelete}/>
      <Toast toast={toast} onDismiss={dismissToast} dismissLabel={t.dismiss}/>
    </div>
  );
}
