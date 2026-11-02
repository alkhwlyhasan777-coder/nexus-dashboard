import { useCallback, useEffect, useReducer, useState } from "react";
import { buildTaskSeed, normalizeTasks } from "./tasks.data";

const KEY = "tasks:v1";
const BACKUP_KEY = "tasks:v1:backup";
const OK = { corrupt: false, dropped: 0 };

function readStored() {
  let raw;
  try { raw = localStorage.getItem(KEY); } catch { return { tasks: buildTaskSeed(), status: OK }; }
  if (raw === null) return { tasks: buildTaskSeed(), status: OK };
  try {
    const result = normalizeTasks(JSON.parse(raw));
    if (result) return { tasks: result.tasks, status: { corrupt: false, dropped: result.dropped } };
  } catch { /* preserve the invalid value below */ }
  try { localStorage.setItem(BACKUP_KEY, raw); } catch { /* storage may be full */ }
  return { tasks: [], status: { corrupt: true, dropped: 0 } };
}

function reducer(state, action) {
  switch (action.type) {
    case "add": return [action.task, ...state];
    case "update": return state.map((task) => task.id === action.task.id ? action.task : task);
    case "remove": return state.filter((task) => task.id !== action.id);
    case "restore": { const next = [...state]; next.splice(action.index, 0, action.task); return next; }
    case "replace": return action.tasks;
    default: return state;
  }
}

const createId = () => globalThis.crypto?.randomUUID?.() ?? `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function useTasks({ onExternalChange } = {}) {
  const [initial] = useState(readStored);
  const [tasks, dispatch] = useReducer(reducer, initial.tasks);
  const [status, setStatus] = useState(initial.status);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch { /* storage unavailable */ }
  }, [tasks]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== KEY || !event.newValue) return;
      try {
        const result = normalizeTasks(JSON.parse(event.newValue));
        if (!result) return;
        dispatch({ type: "replace", tasks: result.tasks });
        setStatus({ corrupt: false, dropped: result.dropped });
        onExternalChange?.();
      } catch { /* ignore malformed updates from another tab */ }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [onExternalChange]);

  const add = useCallback((values) => {
    const now = new Date().toISOString();
    const task = { ...values, id: createId(), createdAt: now, completedAt: values.status === "completed" ? now : null };
    dispatch({ type: "add", task });
    return task;
  }, []);

  const update = useCallback((values) => {
    dispatch({ type: "update", task: { ...values, completedAt: values.status === "completed" ? (values.completedAt || new Date().toISOString()) : null } });
  }, []);

  const remove = useCallback((id) => {
    const index = tasks.findIndex((task) => task.id === id);
    const task = tasks[index];
    if (!task) return null;
    dispatch({ type: "remove", id });
    return { task, index };
  }, [tasks]);

  const restore = useCallback(({ task, index }) => dispatch({ type: "restore", task, index }), []);
  const acknowledge = useCallback(() => setStatus(OK), []);

  return { tasks, status, add, update, remove, restore, acknowledge };
}
