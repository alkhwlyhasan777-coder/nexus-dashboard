import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Toast from "../../components/ui/Toast";
import { useUI } from "../../context/UIcontext";
import useToday from "../../hooks/useToday";
import { T as LEAD_T } from "../Leads/leads.i18n";
import { T } from "./deals.i18n";
import useClients from "./useClients";
import useDeals from "./useDeals";

const DealsContext = createContext(null);

export function useDealsCtx() {
  const ctx = useContext(DealsContext);
  if (!ctx) throw new Error("useDealsCtx must be used inside <DealsLayout>");
  return ctx;
}

/*
  Route element for /deals and /pipeline. One store, one toast and one set of actions for both pages,
  so a change made on one page is on the other the moment you open it (and an Undo toast survives navigation).
*/
export default function DealsLayout() {
  const { lang } = useUI();
  const t = T[lang];
  const leadT = LEAD_T[lang];
  const today = useToday();

  const [toast, setToast] = useState(null);
  const dismiss = useCallback(() => setToast(null), []);
  const notify = useCallback((message, extra = {}) => setToast({ id: Date.now(), message, ...extra }), []);
  const onExternalChange = useCallback(() => notify(t.syncedFromTab), [notify, t]);

  const { deals, status, acknowledge, resetToSample, add, update, remove, restore } = useDeals({ onExternalChange });
  const clients = useClients();

  /* A deal shows its client's CURRENT name; if the client was deleted it falls back to the saved name */
  const byKey = useMemo(() => new Map(clients.map((c) => [c.key, c])), [clients]);
  const resolve = useCallback((deal) => byKey.get(`${deal.clientType}:${deal.clientId}`)
    ?? { type: deal.clientType, id: deal.clientId, name: deal.clientName || "—", missing: true }, [byKey]);

  const note = (lead) => (lead ? t.leadSynced(lead.name, leadT[`s_${lead.status}`]) : null);
  const join = (...parts) => parts.filter(Boolean).join(" · ");

  /* Actions shared by both pages. Every change flows into `deals`, so every number and column updates by itself. */
  const create = useCallback((values) => {
    const { lead } = add(values);
    notify(join(t.added(values.title), note(lead)));
  }, [add, notify, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const edit = useCallback((values) => {
    const { lead } = update(values);
    notify(join(t.updated(values.title), note(lead)));
  }, [update, notify, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = useCallback((deal, next) => {
    if (next === deal.stage) return;
    const { lead } = update({ ...deal, stage: next });
    notify(
      join(t.movedTo(deal.title, t[`st_${next}`]), note(lead)),
      lead ? {} : { actionLabel: t.undo, onAction: () => update({ ...deal, stage: deal.stage }) }
    );
  }, [update, notify, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const destroy = useCallback((deal) => {
    const removed = remove(deal.id);
    notify(t.deleted(removed.deal.title), {
      actionLabel: t.undo,
      onAction: () => { restore(removed); notify(t.restored(removed.deal.title)); },
    });
  }, [remove, restore, notify, t]);

  const value = useMemo(
    () => ({ deals, status, acknowledge, resetToSample, clients, resolve, today, notify, create, edit, move, destroy }),
    [deals, status, acknowledge, resetToSample, clients, resolve, today, notify, create, edit, move, destroy]
  );

  return (
    <DealsContext.Provider value={value}>
      <Outlet />
      <Toast toast={toast} onDismiss={dismiss} dismissLabel={t.dismiss} />
    </DealsContext.Provider>
  );
}