import { STAGES, PROBABILITY } from "../Deals/deals.data";
import { STATUSES as LEAD_STATUSES } from "../Leads/leads.data";
import { TASK_STATUSES } from "../Tasks/tasks.data";

const validDate = (value) => value && !Number.isNaN(new Date(value).getTime());

export function buildAnalytics(deals, leads, customers, tasks, now = new Date()) {
  const wonDeals = deals.filter((deal) => deal.stage === "won");
  const lostDeals = deals.filter((deal) => deal.stage === "lost");
  const openDeals = deals.filter((deal) => !["won", "lost"].includes(deal.stage));
  const closedDeals = [...wonDeals, ...lostDeals];
  const wonRevenue = wonDeals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
  const pipelineValue = openDeals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
  const weightedPipeline = openDeals.reduce((sum, deal) => sum + Number(deal.value || 0) * (PROBABILITY[deal.stage] ?? 0), 0);
  const activeLeads = leads.filter((lead) => !["won", "lost"].includes(lead.status));
  const winRate = closedDeals.length ? wonDeals.length / closedDeals.length : 0;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const taskCompletion = tasks.length ? completedTasks / tasks.length : 0;
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, date, revenue: 0, deals: 0, leads: 0 };
  });
  const byMonth = new Map(months.map((month) => [month.key, month]));
  wonDeals.forEach((deal) => {
    const stamp = deal.closedAt || deal.createdAt;
    if (!validDate(stamp)) return;
    const key = new Date(stamp).toISOString().slice(0, 7);
    const bucket = byMonth.get(key);
    if (bucket) { bucket.revenue += Number(deal.value || 0); bucket.deals += 1; }
  });
  leads.forEach((lead) => {
    if (!validDate(lead.createdAt)) return;
    const key = new Date(lead.createdAt).toISOString().slice(0, 7);
    const bucket = byMonth.get(key);
    if (bucket) bucket.leads += 1;
  });
  const stageRows = STAGES.map((stage) => ({
    stage,
    count: deals.filter((deal) => deal.stage === stage).length,
    value: deals.filter((deal) => deal.stage === stage).reduce((sum, deal) => sum + Number(deal.value || 0), 0),
  }));
  const leadRows = LEAD_STATUSES.map((status) => ({ status, count: leads.filter((lead) => lead.status === status).length }));
  const taskRows = TASK_STATUSES.map((status) => ({ status, count: tasks.filter((task) => task.status === status).length }));
  const overdueTasks = tasks.filter((task) => task.status !== "completed" && task.dueDate && task.dueDate < [
    now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")
  ].join("-")).length;
  return {
    totals: { deals: deals.length, openDeals: openDeals.length, pipelineValue, weightedPipeline, wonRevenue, winRate, won: wonDeals.length, lost: lostDeals.length, leads: leads.length, activeLeads: activeLeads.length, customers: customers.length, tasks: tasks.length, completedTasks, taskCompletion, overdueTasks },
    months, stageRows, leadRows, taskRows,
  };
}
