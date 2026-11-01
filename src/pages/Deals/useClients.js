import { useEffect, useState } from "react";

import { listClients } from "../../lib/clients";

/* Leads and customers a deal can be linked to. Refreshes if another tab changes them. */
export default function useClients() {
  const [clients, setClients] = useState(listClients);
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "leads:v1" || e.key === "customers:v1") setClients(listClients());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return clients;
}