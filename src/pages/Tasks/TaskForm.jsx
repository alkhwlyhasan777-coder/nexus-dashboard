import { useState } from "react";
import { isValidDate } from "../../lib/dates";
import { OWNERS } from "../../lib/team";
import { button, field } from "../../components/ui/tokens";
import { TASK_PRIORITIES, TASK_STATUSES } from "./tasks.data";

export default function TaskForm({ initial, t, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => ({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    status: initial?.status ?? "todo",
    priority: initial?.priority ?? "medium",
    dueDate: initial?.dueDate ?? "",
    assigneeId: initial?.assigneeId ?? "",
    completedAt: initial?.completedAt ?? null,
  }));
  const [error, setError] = useState("");
  const change = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!values.title.trim()) { setError(t.required); return; }
    if (values.dueDate && !isValidDate(values.dueDate)) { setError(t.invalidDate); return; }
    onSubmit({ ...values, title: values.title.trim(), description: values.description.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="task-title">{t.taskTitle}</label>
        <input id="task-title" data-autofocus autoFocus value={values.title} onChange={(e) => change("title", e.target.value)} placeholder={t.titlePlaceholder} maxLength={120} className={field} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="task-description">{t.description}</label>
        <textarea id="task-description" value={values.description} onChange={(e) => change("description", e.target.value)} placeholder={t.descriptionPlaceholder} rows={3} maxLength={1000} className={`${field} h-auto py-2`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="task-status">{t.statusField}</label>
          <select id="task-status" value={values.status} onChange={(e) => change("status", e.target.value)} className={field}>
            {TASK_STATUSES.map((status) => <option key={status} value={status}>{t[`st_${status}`]}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="task-priority">{t.priorityField}</label>
          <select id="task-priority" value={values.priority} onChange={(e) => change("priority", e.target.value)} className={field}>
            {TASK_PRIORITIES.map((priority) => <option key={priority} value={priority}>{t[`pr_${priority}`]}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="task-due">{t.dueField}</label>
          <input id="task-due" type="date" value={values.dueDate} onChange={(e) => change("dueDate", e.target.value)} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="task-assignee">{t.assigneeField}</label>
          <select id="task-assignee" value={values.assigneeId} onChange={(e) => change("assigneeId", e.target.value)} className={field}>
            <option value="">{t.noAssigneeOption}</option>
            {OWNERS.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
          </select>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={`${button.base} ${button.secondary}`}>{t.cancel}</button>
        <button type="submit" className={`${button.base} ${button.primary}`}>{initial ? t.save : t.create}</button>
      </div>
    </form>
  );
}
