import { useCallback, useMemo, useState } from "react";
import { toISODate } from "../../lib/dates";
import { makeFormatters } from "../../lib/format";
import { useUI } from "../../context/UIcontext";
import { accent, button, card, field, muted } from "../../components/ui/tokens";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/layout/navbar/Icon";
import IconButton from "../../components/layout/navbar/IconButton";
import Toast from "../../components/ui/Toast";
import { getOwner } from "../../lib/team";
import { isTaskOverdue, TASK_PRIORITIES, TASK_STATUSES } from "./tasks.data";
import useTasks from "./useTasks";
import TaskModals from "./TaskModals";
import { T } from "./tasks.i18n";

const PRIORITY_TONE = { low: "neutral", medium: "blue", high: "amber", urgent: "red" };

export default function Tasks() {
  const { lang } = useUI();
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(lang === "ar" ? "ar-EG" : "en"), [lang]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const today = toISODate();
  const { tasks, status: dataStatus, add, update, remove, restore, acknowledge } = useTasks({
    onExternalChange: () => setToast({ id: Date.now(), message: t.synced }),
  });

  const notify = useCallback((message, extra = {}) => setToast({ id: Date.now(), message, ...extra }), []);
  const visibleTasks = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang === "ar" ? "ar" : "en");
    return tasks.filter((task) => {
      const matchesQuery = !q || `${task.title} ${task.description} ${getOwner(task.assigneeId)?.name ?? ""}`.toLocaleLowerCase(lang === "ar" ? "ar" : "en").includes(q);
      return matchesQuery && (statusFilter === "all" || task.status === statusFilter) && (priorityFilter === "all" || task.priority === priorityFilter);
    }).sort((a, b) => {
      const aOverdue = isTaskOverdue(a, today), bOverdue = isTaskOverdue(b, today);
      if (aOverdue !== bOverdue) return Number(bOverdue) - Number(aOverdue);
      const dueOrder = (a.dueDate || "9999-99-99").localeCompare(b.dueDate || "9999-99-99");
      if (dueOrder) return dueOrder;
      return TASK_PRIORITIES.indexOf(b.priority) - TASK_PRIORITIES.indexOf(a.priority);
    });
  }, [tasks, query, statusFilter, priorityFilter, today, lang]);

  const counts = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((task) => task.status === "todo").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    completed: tasks.filter((task) => task.status === "completed").length,
    overdue: tasks.filter((task) => isTaskOverdue(task, today)).length,
  }), [tasks, today]);

  const openAdd = () => setModal({ type: "add" });
  const openEdit = (task) => setModal({ type: "edit", task });
  const openDelete = (task) => setModal({ type: "delete", task });
  const closeModal = () => setModal(null);
  const save = (values) => {
    if (modal.type === "edit") { update({ ...modal.task, ...values }); notify(t.updated(values.title)); }
    else { add(values); notify(t.added(values.title)); }
    closeModal();
  };
  const deleteTask = () => {
    const removed = remove(modal.task.id);
    if (removed) notify(t.deleted(removed.task.title), { actionLabel: t.undo, onAction: () => { restore(removed); notify(t.restored(removed.task.title)); } });
    closeModal();
  };
  const toggleComplete = (task) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed";
    update({ ...task, status: nextStatus });
    notify(nextStatus === "completed" ? t.updated(task.title) : t.reopen + ": " + task.title);
  };
  const clearFilters = () => { setQuery(""); setStatusFilter("all"); setPriorityFilter("all"); };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">{t.title}</h1><p className={`mt-1 text-sm ${muted}`}>{t.subtitle}</p></div>
        <button type="button" onClick={openAdd} className={`${button.base} ${button.primary}`}><Icon name="plus" size={16}/>{t.add}</button>
      </header>

      {(dataStatus.corrupt || dataStatus.dropped > 0) && (
        <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <p>{dataStatus.corrupt ? t.dataWarning : t.droppedWarning(dataStatus.dropped)}</p>
          <button type="button" onClick={acknowledge} className="mt-1 font-medium underline">{t.dismiss}</button>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ["total", t.total, "tasks"],
          ["todo", t.todo, "leads"],
          ["inProgress", t.inProgress, "forecast"],
          ["completed", t.completed, "check"],
          ["overdue", t.overdue, "alert"],
        ].map(([key, label, icon]) => (
          <div key={key} className={`${card} p-4`}>
            <div className="flex items-center justify-between gap-2"><p className={`text-xs ${muted}`}>{label}</p><span className={`grid size-8 place-items-center rounded-lg ${accent.soft}`}><Icon name={icon} size={16}/></span></div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{fmt.nf.format(counts[key])}</p>
          </div>
        ))}
      </section>

      <section className={`${card} p-4`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-sm"><Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`}/><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.searchLabel} className={`${field} ps-9`}/></div>
          <div className="flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="task-status-filter">{t.status}</label>
            <select id="task-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${field} w-auto min-w-36`}><option value="all">{t.allStatuses}</option>{TASK_STATUSES.map((s) => <option key={s} value={s}>{t[`st_${s}`]}</option>)}</select>
            <label className="sr-only" htmlFor="task-priority-filter">{t.priority}</label>
            <select id="task-priority-filter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={`${field} w-auto min-w-36`}><option value="all">{t.allPriorities}</option>{TASK_PRIORITIES.map((p) => <option key={p} value={p}>{t[`pr_${p}`]}</option>)}</select>
            {(query || statusFilter !== "all" || priorityFilter !== "all") && <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>{t.clear}</button>}
          </div>
          <p className={`text-xs lg:ms-auto ${muted}`} aria-live="polite">{t.resultCount(fmt.nf.format(visibleTasks.length), fmt.nf.format(tasks.length))}</p>
        </div>
      </section>

      {visibleTasks.length === 0 ? (
        <div className={`${card} flex flex-col items-center gap-3 px-4 py-14 text-center`}>
          <span className={`grid size-12 place-items-center rounded-full ${accent.soft}`}><Icon name="tasks" size={22}/></span>
          <div><p className="font-semibold">{tasks.length ? t.noResults : t.empty}</p><p className={`mt-1 text-sm ${muted}`}>{tasks.length ? t.noResultsHint : t.emptyHint}</p></div>
          {tasks.length ? <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>{t.clear}</button> : <button type="button" onClick={openAdd} className={`${button.base} ${button.primary}`}>{t.add}</button>}
        </div>
      ) : (
        <section className={`${card} overflow-hidden`}>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {visibleTasks.map((task) => {
              const owner = getOwner(task.assigneeId);
              const overdue = isTaskOverdue(task, today);
              return (
                <li key={task.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => toggleComplete(task)} aria-label={task.status === "completed" ? t.reopen : t.markComplete} title={task.status === "completed" ? t.reopen : t.markComplete} className={`grid size-9 shrink-0 place-items-center rounded-full border transition-colors ${task.status === "completed" ? "border-emerald-500 bg-emerald-500 text-white" : "border-neutral-300 text-transparent hover:border-emerald-500 dark:border-neutral-700"}`}><Icon name="check" size={16}/></button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><p className={`truncate text-sm font-semibold ${task.status === "completed" ? "text-neutral-400 line-through" : ""}`}>{task.title}</p><Badge tone={PRIORITY_TONE[task.priority]}>{t[`pr_${task.priority}`]}</Badge>{overdue && <Badge tone="red">{t.overdueLabel}</Badge>}</div>
                    {task.description && <p className={`mt-1 line-clamp-2 text-xs ${muted}`}>{task.description}</p>}
                    <div className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${muted}`}>
                      <span className="inline-flex items-center gap-1"><Icon name="calendar" size={13}/>{task.dueDate ? fmt.date.format(new Date(`${task.dueDate}T00:00:00`)) : "—"}</span>
                      <span className="inline-flex items-center gap-1"><Icon name="customers" size={13}/>{owner?.name ?? t.noAssignee}</span>
                      <span>{t[`st_${task.status}`]}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-1">
                    <IconButton label={t.edit} onClick={() => openEdit(task)}><Icon name="edit" size={16}/></IconButton>
                    <IconButton label={t.delete} onClick={() => openDelete(task)} className="hover:text-red-600 dark:hover:text-red-400"><Icon name="trash" size={16}/></IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <TaskModals modal={modal} t={t} onClose={closeModal} onSave={save} onDelete={deleteTask}/>
      <Toast toast={toast} onDismiss={() => setToast(null)} dismissLabel={t.dismiss}/>
    </div>
  );
}
