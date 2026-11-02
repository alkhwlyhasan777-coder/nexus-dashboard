export const TASK_STATUSES = ["todo", "in_progress", "completed"];
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"];

const SAMPLE_TASKS = [
  { title: "Prepare proposal for enterprise client", description: "Finalize pricing and scope before sending the proposal.", status: "in_progress", priority: "high", dueOffset: 1, assigneeId: "u-mostafa" },
  { title: "Follow up with new leads", description: "Contact leads added this week and update their next steps.", status: "todo", priority: "medium", dueOffset: 2, assigneeId: "u-laila" },
  { title: "Review Q4 sales pipeline", description: "Check deal stages and identify opportunities that need attention.", status: "todo", priority: "urgent", dueOffset: 0, assigneeId: "u-sara" },
  { title: "Send onboarding documents", description: "Share the onboarding checklist with the new customer.", status: "completed", priority: "low", dueOffset: -1, assigneeId: "u-omar" },
  { title: "Update customer records", description: "Verify contact details and company information.", status: "in_progress", priority: "medium", dueOffset: 4, assigneeId: "u-daniel" },
];

const day = 86400000;
const localDate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export function buildTaskSeed() {
  const now = new Date();
  return SAMPLE_TASKS.map((task, index) => {
    const due = new Date(now);
    due.setDate(due.getDate() + task.dueOffset);
    return {
      id: `task-sample-${index + 1}`,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: localDate(due),
      assigneeId: task.assigneeId,
      createdAt: new Date(now.getTime() - (index + 1) * day).toISOString(),
      completedAt: task.status === "completed" ? now.toISOString() : null,
    };
  });
}

export function normalizeTasks(value) {
  if (!Array.isArray(value)) return null;
  const seen = new Set();
  const tasks = [];
  let dropped = 0;
  value.forEach((raw) => {
    if (!raw || typeof raw !== "object" || raw.id == null || seen.has(String(raw.id))) {
      dropped += 1;
      return;
    }
    seen.add(String(raw.id));
    tasks.push({
      id: String(raw.id),
      title: typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "Untitled task",
      description: typeof raw.description === "string" ? raw.description : "",
      status: TASK_STATUSES.includes(raw.status) ? raw.status : "todo",
      priority: TASK_PRIORITIES.includes(raw.priority) ? raw.priority : "medium",
      dueDate: typeof raw.dueDate === "string" && /^\\d{4}-\\d{2}-\\d{2}$/.test(raw.dueDate) ? raw.dueDate : "",
      assigneeId: typeof raw.assigneeId === "string" ? raw.assigneeId : "",
      createdAt: typeof raw.createdAt === "string" && !Number.isNaN(Date.parse(raw.createdAt)) ? raw.createdAt : new Date().toISOString(),
      completedAt: typeof raw.completedAt === "string" && !Number.isNaN(Date.parse(raw.completedAt)) ? raw.completedAt : null,
    });
  });
  return { tasks, dropped };
}

export const isTaskOverdue = (task, today) =>
  task.status !== "completed" && Boolean(task.dueDate) && task.dueDate < today;
