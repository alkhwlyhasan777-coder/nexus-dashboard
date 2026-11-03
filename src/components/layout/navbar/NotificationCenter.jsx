import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../../../context/UIcontext";
import useTasks from "../../../pages/Tasks/useTasks";
import { isTaskOverdue } from "../../../pages/Tasks/tasks.data";
import Icon from "./Icon";
import IconButton from "./IconButton";
import Dropdown from "./Dropdown";

const readList = (key) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : []; }
  catch { return []; }
};
const saveList = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
};
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function NotificationCenter() {
  const { lang } = useUI();
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(() => readList("notifications:muted"));
  const [dismissed, setDismissed] = useState(() => readList("notifications:dismissed"));
  const [read, setRead] = useState(() => readList("notifications:read"));
  const [showMuted, setShowMuted] = useState(false);
  const ar = lang === "ar";
  const labels = ar ? {
    title: "الإشعارات", empty: "لا توجد إشعارات جديدة", muted: "المكتومة", all: "النشطة",
    overdue: "مهمة متأخرة", today: "مهمة مستحقة اليوم", urgent: "مهمة عاجلة",
    delete: "حذف", mute: "كتم", unmute: "إلغاء الكتم", markRead: "تحديد كمقروء",
    viewTasks: "عرض المهام", unread: "غير مقروء",
  } : {
    title: "Notifications", empty: "You're all caught up", muted: "Muted", all: "Active",
    overdue: "Overdue task", today: "Task due today", urgent: "Urgent task",
    delete: "Delete", mute: "Mute", unmute: "Unmute", markRead: "Mark as read",
    viewTasks: "View tasks", unread: "Unread",
  };

  const notifications = useMemo(() => {
    const today = todayLocal();
    return tasks.flatMap((task) => {
      if (task.status === "completed") return [];
      const items = [];
      if (isTaskOverdue(task, today)) items.push({ id: `${task.id}:overdue`, taskId: task.id, title: labels.overdue, detail: task.title, severity: "red" });
      else if (task.dueDate === today) items.push({ id: `${task.id}:today`, taskId: task.id, title: labels.today, detail: task.title, severity: "amber" });
      if (task.priority === "urgent" && !isTaskOverdue(task, today) && task.dueDate !== today) items.push({ id: `${task.id}:urgent`, taskId: task.id, title: labels.urgent, detail: task.title, severity: "violet" });
      return items;
    }).filter((item) => !dismissed.includes(item.id));
  }, [tasks, dismissed, labels.overdue, labels.today, labels.urgent]);

  const active = notifications.filter((item) => !muted.includes(item.id));
  const unreadCount = active.filter((item) => !read.includes(item.id)).length;
  const visible = notifications.filter((item) => showMuted ? muted.includes(item.id) : !muted.includes(item.id));

  const updateList = (key, setter, current, next) => { setter(next); saveList(key, next); };
  const markRead = (id) => updateList("notifications:read", setRead, read, [...new Set([...read, id])]);
  const toggleMuted = (id) => updateList("notifications:muted", setMuted, muted, muted.includes(id) ? muted.filter((value) => value !== id) : [...muted, id]);
  const remove = (id) => {
    updateList("notifications:dismissed", setDismissed, dismissed, [...dismissed, id]);
    updateList("notifications:muted", setMuted, muted, muted.filter((value) => value !== id));
    updateList("notifications:read", setRead, read, read.filter((value) => value !== id));
  };

  return (
    <Dropdown align="end" className="w-[min( min( calc(100vw-2rem), 24rem), 24rem)]">
      {({ toggle, props }) => (
        <IconButton {...props} label={unreadCount ? `${labels.title} (${unreadCount})` : labels.title} badge={unreadCount > 0} onClick={toggle}>
          <Icon name="bell" size={18} />
        </IconButton>
      )}
    >
      <section className="w-[min( calc(100vw-2rem), 24rem)] overflow-hidden">
        <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold">{labels.title}</h3>
            <p className="text-xs text-neutral-500">{unreadCount} {labels.unread}</p>
          </div>
          <button type="button" onClick={() => setShowMuted((value) => !value)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
            {showMuted ? labels.all : labels.muted}
          </button>
        </header>
        <div className="max-h-[min(65vh,26rem)] overflow-y-auto">
          {visible.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-neutral-500">{labels.empty}</div>
          ) : visible.map((item) => (
            <article key={item.id} className={`border-b border-neutral-100 px-4 py-3 last:border-0 dark:border-neutral-800 ${!read.includes(item.id) && !muted.includes(item.id) ? "bg-blue-50/60 dark:bg-blue-500/5" : ""}`}>
              <div className="flex gap-3">
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.severity === "red" ? "bg-red-500" : item.severity === "amber" ? "bg-amber-500" : "bg-violet-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</p>
                  <p className="mt-0.5 break-words text-xs text-neutral-600 dark:text-neutral-400">{item.detail}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => { markRead(item.id); navigate("/tasks"); }} className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">{labels.viewTasks}</button>
                    {!showMuted && !read.includes(item.id) && <button type="button" onClick={() => markRead(item.id)} className="text-xs text-neutral-500 hover:underline">{labels.markRead}</button>}
                    <button type="button" onClick={() => toggleMuted(item.id)} className="text-xs text-neutral-500 hover:underline">{muted.includes(item.id) ? labels.unmute : labels.mute}</button>
                    <button type="button" onClick={() => remove(item.id)} className="text-xs text-red-600 hover:underline dark:text-red-400">{labels.delete}</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Dropdown>
  );
}
