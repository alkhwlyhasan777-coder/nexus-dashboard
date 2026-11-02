import { useMemo } from "react";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/layout/navbar/Icon";
import IconButton from "../../components/layout/navbar/IconButton";
import { button, muted } from "../../components/ui/tokens";
import { getOwner } from "../../lib/team";
import { isTaskOverdue } from "./tasks.data";

const PRIORITY_TONE = { low: "neutral", medium: "blue", high: "amber", urgent: "red" };

export default function useTaskTable({ t, fmt, query, today, onEdit, onDelete, onToggle }) {
  return useMemo(() => {
    const identity = (task) => (
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={() => onToggle(task)} aria-label={task.status === "completed" ? t.reopen : t.markComplete}
          className={`grid size-8 shrink-0 place-items-center rounded-full border transition-colors ${task.status === "completed" ? "border-emerald-500 bg-emerald-500 text-white" : "border-neutral-300 text-transparent hover:border-emerald-500 dark:border-neutral-700"}`}>
          <Icon name="check" size={15}/>
        </button>
        <div className="min-w-0">
          <p className={`truncate font-medium ${task.status === "completed" ? "text-neutral-400 line-through" : ""}`}>{task.title}</p>
          <p className={`truncate text-xs ${muted}`}>{task.description || "—"}</p>
        </div>
      </div>
    );
    const status = (task) => <Badge tone={task.status === "completed" ? "emerald" : task.status === "in_progress" ? "blue" : "neutral"}>{t[`st_${task.status}`]}</Badge>;
    const priority = (task) => <Badge tone={PRIORITY_TONE[task.priority]}>{t[`pr_${task.priority}`]}</Badge>;
    const due = (task) => {
      if (!task.dueDate) return <span className={muted}>—</span>;
      const overdue = isTaskOverdue(task, today);
      return <span className={overdue ? "font-medium text-red-600 dark:text-red-400" : ""}>{fmt.date.format(new Date(`${task.dueDate}T00:00:00`))}</span>;
    };
    const actions = (task) => (
      <div className="flex justify-end gap-1">
        <IconButton label={t.editNamed(task.title)} onClick={() => onEdit(task)}><Icon name="edit" size={16}/></IconButton>
        <IconButton label={t.deleteNamed(task.title)} onClick={() => onDelete(task)} className="hover:text-red-600 dark:hover:text-red-400"><Icon name="trash" size={16}/></IconButton>
      </div>
    );
    const columns = [
      { id: "title", header: t.task, sortable: true, cell: identity },
      { id: "status", header: t.status, sortable: true, min: 560, cell: status },
      { id: "priority", header: t.priority, sortable: true, min: 680, cell: priority },
      { id: "dueDate", header: t.dueDate, sortable: true, min: 800, cell: due },
      { id: "assignee", header: t.assignee, sortable: true, min: 940, cell: (task) => getOwner(task.assigneeId)?.name ?? t.noAssignee },
      { id: "actions", header: t.actions, hideHeader: true, align: "end", cell: actions },
    ];
    const renderCard = (task) => (
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">{identity(task)}</div>
          {status(task)}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">{priority(task)}{isTaskOverdue(task, today) && <Badge tone="red">{t.overdueLabel}</Badge>}</div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {[[t.dueDate, due(task)], [t.assignee, getOwner(task.assigneeId)?.name ?? t.noAssignee]].map(([label, value]) => (
            <div key={label} className="min-w-0"><dt className={`text-xs ${muted}`}>{label}</dt><dd className="mt-1 truncate font-medium">{value}</dd></div>
          ))}
        </dl>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => onEdit(task)} className={`${button.base} ${button.secondary} flex-1`}><Icon name="edit" size={15}/>{t.edit}</button>
          <button type="button" onClick={() => onDelete(task)} className={`${button.base} ${button.dangerGhost} flex-1`}><Icon name="trash" size={15}/>{t.delete}</button>
        </div>
      </div>
    );
    return { columns, renderCard };
  }, [t, fmt, query, today, onEdit, onDelete, onToggle]);
}
