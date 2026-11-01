import { useCallback, useEffect, useReducer, useState } from "react";
import { syncLeadForDeal } from "../../lib/clients";
import { buildSeed, normalizeDeals } from "./deals.data";

/*
  Deal store: a reducer persisted to localStorage. Used by BOTH the Deals and the Pipeline pages
  through DealsLayout, so they always show the same data.
  - Stored data is repaired on load (see normalizeDeals). Unreadable data is backed up, never silently lost.
  - Changing a deal's stage is logged, and Won / Lost stamps the closing time.
  - Another browser tab changing the data updates this one automatically.
  - Won / Lost also updates the linked lead (see lib/clients.js).
  To use a real API, keep this hook's return shape and replace the dispatch calls with fetches.
*/
const KEY = "deals:v1";
const BACKUP_KEY = "deals:v1:backup";
const OK = { corrupt: false, dropped: 0 };

function readStored() {
  let raw;
  try { raw = localStorage.getItem(KEY); } catch { return { deals: buildSeed(), status: OK }; } // storage unavailable
  if (raw === null) return { deals: buildSeed(), status: OK };
  try {
    const result = normalizeDeals(JSON.parse(raw));
    if (result) return { deals: result.deals, status: { corrupt: false, dropped: result.dropped } };
  } catch { /* not valid JSON: handled below */ }
  try { localStorage.setItem(BACKUP_KEY, raw); } catch { /* storage full */ }
  return { deals: [], status: { corrupt: true, dropped: 0 } };
}

/* Merge an edited deal into the stored one, keeping history and closing time consistent */
function applyEdit(prev, next) {
  if (prev.stage === next.stage) return { ...next, activity: prev.activity, closedAt: prev.closedAt };
  const at = new Date().toISOString();
  const closing = next.stage === "won" || next.stage === "lost";
  return { ...next, closedAt: closing ? at : null, activity: [...(prev.activity ?? []), { type: "stage", from: prev.stage, to: next.stage, at }] };
}

function reducer(state, action) {
  switch (action.type) {
    case "add": return [action.deal, ...state];
    case "update": return state.map((d) => (d.id === action.deal.id ? applyEdit(d, action.deal) : d));
    case "remove": return state.filter((d) => d.id !== action.id);
    case "restore": { const next = [...state]; next.splice(action.index, 0, action.deal); return next; }
    case "replace": return action.deals;
    default: return state;
  }
}

const newId = () => globalThis.crypto?.randomUUID?.() ?? `d-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/* Lead status follows the deal when it is won or lost. Returns the lead that changed, or null. */
const syncLead = (deal, all) =>
  deal.clientType === "lead"
    ? syncLeadForDeal(deal.clientId, deal.stage, all.filter((d) => d.id !== deal.id && d.clientType === "lead" && d.clientId === deal.clientId))
    : null;

export default function useDeals({ onExternalChange } = {}) {
  const [initial] = useState(readStored);
  const [deals, dispatch] = useReducer(reducer, initial.deals);
  const [status, setStatus] = useState(initial.status);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(deals)); } catch { /* storage full or blocked */ }
  }, [deals]);

  // Live updates from other tabs (the `storage` event only fires in the OTHER tabs)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        const result = normalizeDeals(JSON.parse(e.newValue));
        if (!result) return;
        dispatch({ type: "replace", deals: result.deals });
        setStatus({ corrupt: false, dropped: result.dropped });
        onExternalChange?.();
      } catch { /* ignore unreadable data from the other tab */ }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [onExternalChange]);

  const add = useCallback((data) => {
    const now = new Date().toISOString();
    const closed = data.stage === "won" || data.stage === "lost";
    const deal = { ...data, id: newId(), createdAt: now, closedAt: closed ? now : null, activity: [{ type: "created", at: now }] };
    dispatch({ type: "add", deal });
    return { deal, lead: closed ? syncLead(deal, deals) : null };
  }, [deals]);

  const update = useCallback((deal) => {
    const prev = deals.find((d) => d.id === deal.id);
    dispatch({ type: "update", deal });
    return { lead: prev && prev.stage !== deal.stage ? syncLead(deal, deals) : null };
  }, [deals]);

  const remove = useCallback((id) => {
    const index = deals.findIndex((d) => d.id === id);
    const deal = deals[index];
    dispatch({ type: "remove", id });
    return { deal, index };
  }, [deals]);

  const restore = useCallback(({ deal, index }) => dispatch({ type: "restore", deal, index }), []);
  const resetToSample = useCallback(() => { dispatch({ type: "replace", deals: buildSeed() }); setStatus(OK); }, []);
  const acknowledge = useCallback(() => setStatus((s) => ({ ...s, dropped: 0 })), []);

  return { deals, status, acknowledge, resetToSample, add, update, remove, restore };
}





















































// import { useCallback, useEffect, useReducer } from "react";


// import { syncLeadForDeal } from "../../lib/clients";
// import { buildSeed } from "./deals.data";

// /*
//   Deal store: a reducer persisted to localStorage.
//   - Changing a deal's stage is logged, and Won / Lost stamps the closing time.
//   - Another browser tab changing the data updates this one automatically.
//   - Won / Lost also updates the linked lead (see lib/clients.js).
//   To use a real API, keep this hook's return shape and replace the dispatch calls with fetches.
// */
// const KEY = "deals:v1";

// const load = () => {
//   try {
//     const raw = localStorage.getItem(KEY);
//     if (raw) return JSON.parse(raw);
//   } catch { /* ignore corrupt or unavailable storage */ }
//   return buildSeed();
// };

// /* Merge an edited deal into the stored one, keeping history and closing time consistent */
// function applyEdit(prev, next) {
//   if (prev.stage === next.stage) return { ...next, activity: prev.activity, closedAt: prev.closedAt };
//   const at = new Date().toISOString();
//   const closing = next.stage === "won" || next.stage === "lost";
//   return { ...next, closedAt: closing ? at : null, activity: [...(prev.activity ?? []), { type: "stage", from: prev.stage, to: next.stage, at }] };
// }

// function reducer(state, action) {
//   switch (action.type) {
//     case "add": return [action.deal, ...state];
//     case "update": return state.map((d) => (d.id === action.deal.id ? applyEdit(d, action.deal) : d));
//     case "remove": return state.filter((d) => d.id !== action.id);
//     case "restore": { const next = [...state]; next.splice(action.index, 0, action.deal); return next; }
//     case "replace": return action.deals;
//     default: return state;
//   }
// }

// const newId = () => globalThis.crypto?.randomUUID?.() ?? `d-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// /* Lead status follows the deal when it is won or lost. Returns the lead that changed, or null. */
// const syncLead = (deal, all) =>
//   deal.clientType === "lead"
//     ? syncLeadForDeal(deal.clientId, deal.stage, all.filter((d) => d.id !== deal.id && d.clientType === "lead" && d.clientId === deal.clientId))
//     : null;

// export default function useDeals({ onExternalChange } = {}) {
//   const [deals, dispatch] = useReducer(reducer, null, load);

//   useEffect(() => {
//     try { localStorage.setItem(KEY, JSON.stringify(deals)); } catch { /* storage full or blocked */ }
//   }, [deals]);

//   // Live updates from other tabs (the `storage` event only fires in the OTHER tabs)
//   useEffect(() => {
//     const onStorage = (e) => {
//       if (e.key !== KEY || !e.newValue) return;
//       try { dispatch({ type: "replace", deals: JSON.parse(e.newValue) }); onExternalChange?.(); } catch { /* ignore bad data */ }
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, [onExternalChange]);

//   const add = useCallback((data) => {
//     const now = new Date().toISOString();
//     const closed = data.stage === "won" || data.stage === "lost";
//     const deal = { ...data, id: newId(), createdAt: now, closedAt: closed ? now : null, activity: [{ type: "created", at: now }] };
//     dispatch({ type: "add", deal });
//     return { deal, lead: closed ? syncLead(deal, deals) : null };
//   }, [deals]);

//   const update = useCallback((deal) => {
//     const prev = deals.find((d) => d.id === deal.id);
//     dispatch({ type: "update", deal });
//     return { lead: prev && prev.stage !== deal.stage ? syncLead(deal, deals) : null };
//   }, [deals]);

//   const remove = useCallback((id) => {
//     const index = deals.findIndex((d) => d.id === id);
//     const deal = deals[index];
//     dispatch({ type: "remove", id });
//     return { deal, index };
//   }, [deals]);

//   const restore = useCallback(({ deal, index }) => dispatch({ type: "restore", deal, index }), []);

//   return { deals, add, update, remove, restore };
// }