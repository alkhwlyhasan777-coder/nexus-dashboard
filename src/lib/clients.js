import { buildSeed as customerSeed } from "../pages/Customers/customers.data";

import { buildSeed as leadSeed } from "../pages/Leads/leads.data";

/*
  Read access to the Leads and Customers stores (both live in localStorage), plus the one write
  Deals needs: keeping a lead's status in step with its deals.
  When you move to a real API, replace these functions with calls to it.
*/
const LEADS_KEY = "leads:v1";
const CUSTOMERS_KEY = "customers:v1";

const read = (key, seed) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupt or unavailable storage */ }
  return seed();
};

export const readLeads = () => read(LEADS_KEY, leadSeed);
export const readCustomers = () => read(CUSTOMERS_KEY, customerSeed);

/* Everyone a deal can be linked to: [{ key: "lead:lead-3", type, id, name, company }] */
export function listClients() {
  const leads = readLeads().map((l) => ({ key: `lead:${l.id}`, type: "lead", id: l.id, name: l.name, company: l.company }));
  const customers = readCustomers().map((c) => ({ key: `customer:${c.id}`, type: "customer", id: c.id, name: c.name, company: c.company }));
  return [...leads, ...customers];
}

/*
  A deal changed stage. Keep the linked lead in step:
    Won  -> the lead becomes "won"
    Lost -> the lead becomes "lost", but only if it has no other open or won deal
  `otherDeals` = the lead's other deals. Returns { id, name, status } when the lead changed, otherwise null.
*/
export function syncLeadForDeal(leadId, stage, otherDeals) {
  let status = null;
  if (stage === "won") status = "won";
  else if (stage === "lost" && !otherDeals.some((d) => d.stage !== "lost")) status = "lost";
  if (!status) return null;

  const leads = readLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead || lead.status === status) return null;

  const at = new Date().toISOString();
  const next = leads.map((l) =>
    l.id === leadId
      ? { ...l, status, activity: [...(l.activity ?? []), { type: "status", from: l.status, to: status, at }] }
      : l
  );
  try { localStorage.setItem(LEADS_KEY, JSON.stringify(next)); } catch { /* storage full or blocked */ }
  return { id: lead.id, name: lead.name, status };
}