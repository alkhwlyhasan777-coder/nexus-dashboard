/* Stages, seed data and pipeline maths for the Deals page. No React in here. */
import { addDays, isValidDate, toISODate } from "../../lib/dates";
import { OWNERS } from "../../lib/team";
import { buildSeed as customerSeed } from "../Customers/customers.data";
import { buildSeed as leadSeed } from "../Leads/leads.data";

export const STAGES = ["prospecting", "qualification", "proposal", "negotiation", "won", "lost"];
export const OPEN_STAGES = ["prospecting", "qualification", "proposal", "negotiation"];
export const STAGE_ORDER = Object.fromEntries(STAGES.map((s, i) => [s, i]));
/* Chance of winning at each stage. This drives the weighted forecast. */
export const PROBABILITY = { prospecting: 0.1, qualification: 0.25, proposal: 0.5, negotiation: 0.75, won: 1, lost: 0 };
export const STAGE_TONE = { prospecting: "blue", qualification: "violet", proposal: "cyan", negotiation: "amber", won: "emerald", lost: "red" };
export const STAGE_COLOR = { prospecting: "#3b82f6", qualification: "#8b5cf6", proposal: "#06b6d4", negotiation: "#f59e0b", won: "#10b981", lost: "#ef4444" };

export const isOpen = (deal) => deal.stage !== "won" && deal.stage !== "lost";
/* Open and past its expected closing date. A deal with no valid date is never "overdue", it "needs attention". */
export const isOverdue = (deal, today) => isOpen(deal) && isValidDate(deal.expectedClose) && deal.expectedClose < today;
/* Missing or invalid data the user should fix */
export const needsAttention = (deal) => !isValidDate(deal.expectedClose) || !deal.clientId;
/* When the deal entered its current stage (last stage change, or creation) */
export const lastStageAt = (deal) => {
  const events = (deal.activity ?? []).filter((e) => e.type === "stage" || e.type === "created");
  return events.length ? events[events.length - 1].at : deal.createdAt;
};

const DAY = 86400000;

// title, client (L = lead number, C = customer number), value, stage, closes in N days, created N days ago
const ROWS = [
  ["Annual platform license", "L3", 15000, "negotiation", 12, 20],
  ["Onboarding package", "L10", 31000, "proposal", 20, 17],
  ["Warehouse software rollout", "C1", 42000, "negotiation", 6, 30],
  ["Retail analytics add-on", "C2", 9200, "qualification", 25, 9],
  ["Event ticketing pilot", "L4", 22000, "proposal", 9, 14],
  ["Clinic booking suite", "C11", 14500, "prospecting", 40, 3],
  ["Fleet tracking contract", "L18", 19900, "negotiation", -3, 35],
  ["Support plan renewal", "C5", 8800, "won", -5, 50],
  ["Marketing automation setup", "L6", 18500, "won", -12, 40],
  ["Logistics integration", "L7", 9600, "lost", -20, 33],
  ["Cloud migration", "C13", 26800, "qualification", 30, 8],
  ["Training program", "L9", 12400, "qualification", 18, 11],
  ["Custom reporting", "C16", 13650, "proposal", 14, 12],
  ["Mobile app build", "L24", 28000, "prospecting", 60, 7],
  ["POS rollout", "L26", 13700, "proposal", 11, 29],
  ["Data warehouse", "C10", 17320, "negotiation", 4, 22],
  ["CRM migration", "L14", 14200, "qualification", 21, 21],
  ["Website redesign", "L17", 4100, "lost", -30, 48],
  ["Pharma compliance tool", "L13", 26800, "won", -40, 55],
  ["Restaurant ordering app", "C20", 7980, "prospecting", 35, 5],
  ["Hotel booking engine", "C29", 12000, "proposal", -1, 26],
  ["Insurance portal", "L32", 24500, "negotiation", 8, 23],
  ["Consulting retainer", "C26", 4720, "prospecting", 50, 2],
  ["Seasonal campaign bundle", "L2", 8800, "qualification", 16, 6],
];

export function buildSeed() {
  const now = Date.now();
  const today = toISODate();
  const leads = leadSeed();
  const customers = customerSeed();
  return ROWS.map(([title, ref, value, stage, closeIn, createdAgo], i) => {
    const type = ref[0] === "L" ? "lead" : "customer";
    const client = (type === "lead" ? leads : customers)[Number(ref.slice(1)) - 1];
    const createdAt = new Date(now - createdAgo * DAY).toISOString();
    const closed = stage === "won" || stage === "lost";
    const closedAt = closed ? new Date(now + closeIn * DAY).toISOString() : null;
    const activity = [{ type: "created", at: createdAt }];
    if (stage !== "prospecting") {
      activity.push({ type: "stage", from: "prospecting", to: stage, at: closedAt ?? new Date(now - Math.max(0, createdAgo - 3) * DAY).toISOString() });
    }
    return {
      id: `deal-${i + 1}`,
      title, value, stage, createdAt, closedAt, activity,
      clientType: type, clientId: client.id, clientName: client.name,
      ownerId: i % 7 === 6 ? null : OWNERS[i % OWNERS.length].id,
      expectedClose: addDays(today, closeIn),
      notes: "",
    };
  });
}

/* ---------- pipeline numbers (everything is derived, so it is always up to date) ---------- */

const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

export function computeStats(deals, today) {
  const open = deals.filter(isOpen);
  const won = deals.filter((d) => d.stage === "won");
  const lost = deals.filter((d) => d.stage === "lost");
  const month = today.slice(0, 7);
  const closingThisMonth = open.filter((d) => isValidDate(d.expectedClose) && d.expectedClose.slice(0, 7) === month);
  return {
    openCount: open.length,
    pipeline: sum(open, (d) => d.value),
    weighted: sum(open, (d) => d.value * PROBABILITY[d.stage]),
    avgOpen: open.length ? sum(open, (d) => d.value) / open.length : 0,
    won: won.length,
    lost: lost.length,
    winRate: won.length + lost.length ? won.length / (won.length + lost.length) : 0,
    wonValue: sum(won, (d) => d.value),
    closingCount: closingThisMonth.length,
    closingValue: sum(closingThisMonth, (d) => d.value),
    overdue: open.filter((d) => isOverdue(d, today)).length,
  };
}

/* Value per open stage: total and probability-weighted */
export const pipelineByStage = (deals) =>
  OPEN_STAGES.map((stage) => {
    const inStage = deals.filter((d) => d.stage === stage);
    return { stage, count: inStage.length, total: sum(inStage, (d) => d.value), weighted: sum(inStage, (d) => d.value * PROBABILITY[stage]) };
  });

/* Open deal value by expected close month: an "overdue" bucket first, then the next `months` months */
export function forecastByMonth(deals, today, months = 6) {
  const open = deals.filter(isOpen);
  const [year, month] = today.split("-").map(Number);
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(year, month - 1 + i, 1);
    return { key: toISODate(d).slice(0, 7), date: d, total: 0 };
  });
  const overdue = { key: "overdue", total: 0 };
  open.forEach((d) => {
    if (!isValidDate(d.expectedClose)) return; // no date: not part of the forecast
    if (d.expectedClose < today) { overdue.total += d.value; return; }
    const bucket = buckets.find((b) => b.key === d.expectedClose.slice(0, 7));
    if (bucket) bucket.total += d.value;
  });
  return [overdue, ...buckets];
}

/* ---------- repairing stored data (it may be old, edited by hand, or damaged) ---------- */

const validTime = (v) => typeof v === "string" && !Number.isNaN(Date.parse(v));

/* A safe deal from whatever was stored, or null when there is nothing to save (no id) */
export function normalizeDeal(raw) {
  if (!raw || typeof raw !== "object" || raw.id == null || raw.id === "") return null;
  const value = Number(raw.value);
  return {
    ...raw,
    id: String(raw.id),
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "Untitled deal",
    stage: STAGES.includes(raw.stage) ? raw.stage : "prospecting",
    value: Number.isFinite(value) && value >= 0 ? value : 0,
    expectedClose: isValidDate(raw.expectedClose) ? raw.expectedClose : "",
    clientType: raw.clientType === "lead" || raw.clientType === "customer" ? raw.clientType : "",
    clientId: raw.clientId == null ? "" : String(raw.clientId),
    clientName: typeof raw.clientName === "string" ? raw.clientName : "",
    ownerId: typeof raw.ownerId === "string" && raw.ownerId ? raw.ownerId : null,
    notes: typeof raw.notes === "string" ? raw.notes : "",
    createdAt: validTime(raw.createdAt) ? raw.createdAt : new Date().toISOString(),
    closedAt: validTime(raw.closedAt) ? raw.closedAt : null,
    activity: Array.isArray(raw.activity) ? raw.activity.filter((e) => e && validTime(e.at)) : [],
  };
}

/* { deals, dropped } for a stored list, or null when it is not a list at all.
   Entries with no id, and repeated ids, are dropped and counted. */
export function normalizeDeals(list) {
  if (!Array.isArray(list)) return null;
  const seen = new Set();
  const deals = [];
  let dropped = 0;
  list.forEach((raw) => {
    const deal = normalizeDeal(raw);
    if (!deal || seen.has(deal.id)) { dropped += 1; return; }
    seen.add(deal.id);
    deals.push(deal);
  });
  return { deals, dropped };
}


























// import { addDays, toISODate } from "../../lib/dates";
// import { buildSeed as customerSeed } from "../Customers/customers.data";
// import { buildSeed as leadSeed } from "../Leads/leads.data";

// export const STAGES = ["prospecting", "qualification", "proposal", "negotiation", "won", "lost"];
// export const OPEN_STAGES = ["prospecting", "qualification", "proposal", "negotiation"];
// export const STAGE_ORDER = Object.fromEntries(STAGES.map((s, i) => [s, i]));
// /* Chance of winning at each stage. This drives the weighted forecast. */
// export const PROBABILITY = { prospecting: 0.1, qualification: 0.25, proposal: 0.5, negotiation: 0.75, won: 1, lost: 0 };
// export const STAGE_TONE = { prospecting: "blue", qualification: "violet", proposal: "cyan", negotiation: "amber", won: "emerald", lost: "red" };
// export const STAGE_COLOR = { prospecting: "#3b82f6", qualification: "#8b5cf6", proposal: "#06b6d4", negotiation: "#f59e0b", won: "#10b981", lost: "#ef4444" };

// export const isOpen = (deal) => deal.stage !== "won" && deal.stage !== "lost";

// const DAY = 86400000;

// // title, client (L = lead number, C = customer number), value, stage, closes in N days, created N days ago
// const ROWS = [
//   ["Annual platform license", "L3", 15000, "negotiation", 12, 20],
//   ["Onboarding package", "L10", 31000, "proposal", 20, 17],
//   ["Warehouse software rollout", "C1", 42000, "negotiation", 6, 30],
//   ["Retail analytics add-on", "C2", 9200, "qualification", 25, 9],
//   ["Event ticketing pilot", "L4", 22000, "proposal", 9, 14],
//   ["Clinic booking suite", "C11", 14500, "prospecting", 40, 3],
//   ["Fleet tracking contract", "L18", 19900, "negotiation", -3, 35],
//   ["Support plan renewal", "C5", 8800, "won", -5, 50],
//   ["Marketing automation setup", "L6", 18500, "won", -12, 40],
//   ["Logistics integration", "L7", 9600, "lost", -20, 33],
//   ["Cloud migration", "C13", 26800, "qualification", 30, 8],
//   ["Training program", "L9", 12400, "qualification", 18, 11],
//   ["Custom reporting", "C16", 13650, "proposal", 14, 12],
//   ["Mobile app build", "L24", 28000, "prospecting", 60, 7],
//   ["POS rollout", "L26", 13700, "proposal", 11, 29],
//   ["Data warehouse", "C10", 17320, "negotiation", 4, 22],
//   ["CRM migration", "L14", 14200, "qualification", 21, 21],
//   ["Website redesign", "L17", 4100, "lost", -30, 48],
//   ["Pharma compliance tool", "L13", 26800, "won", -40, 55],
//   ["Restaurant ordering app", "C20", 7980, "prospecting", 35, 5],
//   ["Hotel booking engine", "C29", 12000, "proposal", -1, 26],
//   ["Insurance portal", "L32", 24500, "negotiation", 8, 23],
//   ["Consulting retainer", "C26", 4720, "prospecting", 50, 2],
//   ["Seasonal campaign bundle", "L2", 8800, "qualification", 16, 6],
// ];

// export function buildSeed() {
//   const now = Date.now();
//   const today = toISODate();
//   const leads = leadSeed();
//   const customers = customerSeed();
//   return ROWS.map(([title, ref, value, stage, closeIn, createdAgo], i) => {
//     const type = ref[0] === "L" ? "lead" : "customer";
//     const client = (type === "lead" ? leads : customers)[Number(ref.slice(1)) - 1];
//     const createdAt = new Date(now - createdAgo * DAY).toISOString();
//     const closed = stage === "won" || stage === "lost";
//     const closedAt = closed ? new Date(now + closeIn * DAY).toISOString() : null;
//     const activity = [{ type: "created", at: createdAt }];
//     if (stage !== "prospecting") {
//       activity.push({ type: "stage", from: "prospecting", to: stage, at: closedAt ?? new Date(now - Math.max(0, createdAgo - 3) * DAY).toISOString() });
//     }
//     return {
//       id: `deal-${i + 1}`,
//       title, value, stage, createdAt, closedAt, activity,
//       clientType: type, clientId: client.id, clientName: client.name,
//       expectedClose: addDays(today, closeIn),
//       notes: "",
//     };
//   });
// }

// /* ---------- pipeline numbers (everything is derived, so it is always up to date) ---------- */

// const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

// export function computeStats(deals, today) {
//   const open = deals.filter(isOpen);
//   const won = deals.filter((d) => d.stage === "won");
//   const lost = deals.filter((d) => d.stage === "lost");
//   const month = today.slice(0, 7);
//   const closingThisMonth = open.filter((d) => d.expectedClose.slice(0, 7) === month);
//   return {
//     openCount: open.length,
//     pipeline: sum(open, (d) => d.value),
//     weighted: sum(open, (d) => d.value * PROBABILITY[d.stage]),
//     avgOpen: open.length ? sum(open, (d) => d.value) / open.length : 0,
//     won: won.length,
//     lost: lost.length,
//     winRate: won.length + lost.length ? won.length / (won.length + lost.length) : 0,
//     wonValue: sum(won, (d) => d.value),
//     closingCount: closingThisMonth.length,
//     closingValue: sum(closingThisMonth, (d) => d.value),
//     overdue: open.filter((d) => d.expectedClose < today).length,
//   };
// }

// /* Value per open stage: total and probability-weighted */
// export const pipelineByStage = (deals) =>
//   OPEN_STAGES.map((stage) => {
//     const inStage = deals.filter((d) => d.stage === stage);
//     return { stage, count: inStage.length, total: sum(inStage, (d) => d.value), weighted: sum(inStage, (d) => d.value * PROBABILITY[stage]) };
//   });

// /* Open deal value by expected close month: an "overdue" bucket first, then the next `months` months */
// export function forecastByMonth(deals, today, months = 6) {
//   const open = deals.filter(isOpen);
//   const [year, month] = today.split("-").map(Number);
//   const buckets = Array.from({ length: months }, (_, i) => {
//     const d = new Date(year, month - 1 + i, 1);
//     return { key: toISODate(d).slice(0, 7), date: d, total: 0 };
//   });
//   const overdue = { key: "overdue", total: 0 };
//   open.forEach((d) => {
//     if (d.expectedClose < today) { overdue.total += d.value; return; }
//     const bucket = buckets.find((b) => b.key === d.expectedClose.slice(0, 7));
//     if (bucket) bucket.total += d.value;
//   });
//   return [overdue, ...buckets];
// }