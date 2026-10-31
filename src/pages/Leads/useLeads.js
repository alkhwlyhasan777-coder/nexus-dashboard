import { useCallback, useEffect, useReducer } from "react";
import { buildSeed } from "./leads.data";

/*
  Lead store: a reducer persisted to localStorage, with an activity log per lead.
  To use a real API, keep this hook's return shape and replace the dispatch calls with fetches.
*/
const KEY = "leads:v1";

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt or unavailable storage */ }
  return buildSeed();
};

function reducer(state, action) {
  switch (action.type) {
    case "add": return [action.lead, ...state];
    case "update":
      return state.map((l) => {
        if (l.id !== action.lead.id) return l;
        const activity = [...(l.activity ?? [])];
        if (l.status !== action.lead.status) {
          activity.push({ type: "status", from: l.status, to: action.lead.status, at: new Date().toISOString() });
        }
        return { ...action.lead, activity };
      });
    case "remove": return state.filter((l) => l.id !== action.id);
    case "restore": { const next = [...state]; next.splice(action.index, 0, action.lead); return next; }
    default: return state;
  }
}

const newId = () => globalThis.crypto?.randomUUID?.() ?? `l-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export default function useLeads() {
  const [leads, dispatch] = useReducer(reducer, null, load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(leads)); } catch { /* storage full or blocked */ }
  }, [leads]);

  const add = useCallback((data) => {
    const createdAt = new Date().toISOString();
    const lead = { ...data, id: newId(), createdAt, activity: [{ type: "created", at: createdAt }] };
    dispatch({ type: "add", lead });
    return lead;
  }, []);

  const update = useCallback((lead) => dispatch({ type: "update", lead }), []);

  const remove = useCallback((id) => {
    const index = leads.findIndex((l) => l.id === id);
    const lead = leads[index];
    dispatch({ type: "remove", id });
    return { lead, index };
  }, [leads]);

  const restore = useCallback(({ lead, index }) => dispatch({ type: "restore", lead, index }), []);

  return { leads, add, update, remove, restore };
}