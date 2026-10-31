/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Toast from "../../components/ui/Toast";
import { useUI } from "../../context/UIcontext";
import { T } from "./leads.i18n";
import useLeads from "./useLeads";

const LeadsContext = createContext(null);

export function useLeadsCtx() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeadsCtx must be used inside <LeadsLayout>");
  return ctx;
}

/*
  Route element for /leads and everything under it.
  The list and the details page share one store and one toast, so an "Undo" toast
  keeps working after you navigate from a lead back to the list.
*/
export default function LeadsLayout() {
  const { lang } = useUI();
  const { leads, add, update, remove, restore } = useLeads();
  const [toast, setToast] = useState(null);

  const dismiss = useCallback(() => setToast(null), []);
  const notify = useCallback((message, extra = {}) => setToast({ id: Date.now(), message, ...extra }), []);
  const value = useMemo(
    () => ({ leads, add, update, remove, restore, notify }),
    [leads, add, update, remove, restore, notify]
  );

  return (
    <LeadsContext.Provider value={value}>
      <Outlet />
      <Toast toast={toast} onDismiss={dismiss} dismissLabel={T[lang].dismiss} />
    </LeadsContext.Provider>
  );
}