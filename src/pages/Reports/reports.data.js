import { PROBABILITY } from "../Deals/deals.data";

const validDate = (value) => value && !Number.isNaN(new Date(value).getTime());
const money = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

export function buildReports(deals = [], leads = [], customers = [], tasks = [], now = new Date()) {
  const won = deals.filter((deal) => deal.stage === "won");
  const lost = deals.filter((deal) => deal.stage === "lost");
  const open = deals.filter((deal) => !["won", "lost"].includes(deal.stage));
  const pipeline = open.reduce((sum, deal) => sum + money(deal.value), 0);
  const weighted = open.reduce((sum, deal) => sum + money(deal.value) * (PROBABILITY[deal.stage] ?? 0), 0);
  const wonRevenue = won.reduce((sum, deal) => sum + money(deal.value), 0);
  const closed = won.length + lost.length;
  const winRate = closed ? won.length / closed : 0;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const overdueTasks = tasks.filter((task) => task.status !== "completed" && validDate(task.dueDate) && new Date(task.dueDate) < new Date(now.getFullYear(), now.getMonth(), now.getDate())).length;

  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    return { date, key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, won: 0, pipeline: 0, deals: 0, leads: 0 };
  });
  const monthMap = new Map(months.map((month) => [month.key, month]));
  const monthKey = (value) => {
    if (!validDate(value)) return null;
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };
  won.forEach((deal) => {
    const bucket = monthMap.get(monthKey(deal.closedAt || deal.updatedAt || deal.createdAt));
    if (bucket) { bucket.won += money(deal.value); bucket.deals += 1; }
  });
  open.forEach((deal) => {
    const bucket = monthMap.get(monthKey(deal.expectedCloseDate || deal.closeDate || deal.createdAt));
    if (bucket) bucket.pipeline += money(deal.value) * (PROBABILITY[deal.stage] ?? 0);
  });
  leads.forEach((lead) => {
    const bucket = monthMap.get(monthKey(lead.createdAt));
    if (bucket) bucket.leads += 1;
  });

  const stageRows = [...new Set(deals.map((deal) => deal.stage))].map((stage) => {
    const items = deals.filter((deal) => deal.stage === stage);
    return { stage, count: items.length, value: items.reduce((sum, deal) => sum + money(deal.value), 0) };
  });
  const forecast = [
    { label: "conservative", value: weighted * 0.8 },
    { label: "expected", value: weighted },
    { label: "optimistic", value: Math.min(pipeline, weighted * 1.2) },
  ];
  return {
    totals: { deals: deals.length, won: won.length, lost: lost.length, open: open.length, pipeline, weighted, wonRevenue, winRate, leads: leads.length, customers: customers.length, tasks: tasks.length, completedTasks, overdueTasks },
    months, stageRows, forecast,
  };
}
