const validDate = (value) => typeof value === "string" && !Number.isNaN(Date.parse(value));

export function buildRevenue(deals, now = new Date()) {
  const wonDeals = deals.filter((deal) => deal.stage === "won" && validDate(deal.closedAt))
    .map((deal) => ({ ...deal, revenueDate: new Date(deal.closedAt) }))
    .sort((a, b) => b.revenueDate - a.revenueDate);
  const total = wonDeals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
  const thisMonth = wonDeals.filter((deal) => deal.revenueDate.getFullYear() === now.getFullYear() && deal.revenueDate.getMonth() === now.getMonth());
  const thisYear = wonDeals.filter((deal) => deal.revenueDate.getFullYear() === now.getFullYear());
  const monthBuckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return { date, key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, value: 0, count: 0 };
  });
  wonDeals.forEach((deal) => {
    const key = `${deal.revenueDate.getFullYear()}-${String(deal.revenueDate.getMonth() + 1).padStart(2, "0")}`;
    const bucket = monthBuckets.find((item) => item.key === key);
    if (bucket) { bucket.value += Number(deal.value || 0); bucket.count += 1; }
  });
  const byClient = new Map();
  wonDeals.forEach((deal) => {
    const key = deal.clientId || deal.clientName || deal.id;
    const current = byClient.get(key) || { id: key, name: deal.clientName || "—", value: 0, count: 0 };
    current.value += Number(deal.value || 0);
    current.count += 1;
    byClient.set(key, current);
  });
  return {
    wonDeals, total, count: wonDeals.length,
    average: wonDeals.length ? total / wonDeals.length : 0,
    monthTotal: thisMonth.reduce((sum, deal) => sum + Number(deal.value || 0), 0),
    yearTotal: thisYear.reduce((sum, deal) => sum + Number(deal.value || 0), 0),
    monthCount: thisMonth.length, months: monthBuckets,
    clients: [...byClient.values()].sort((a, b) => b.value - a.value).slice(0, 5),
  };
}
