import { addDays, toISODate } from "../../lib/dates";
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
  const closingThisMonth = open.filter((d) => d.expectedClose.slice(0, 7) === month);
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
    overdue: open.filter((d) => d.expectedClose < today).length,
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
    if (d.expectedClose < today) { overdue.total += d.value; return; }
    const bucket = buckets.find((b) => b.key === d.expectedClose.slice(0, 7));
    if (bucket) bucket.total += d.value;
  });
  return [overdue, ...buckets];
}