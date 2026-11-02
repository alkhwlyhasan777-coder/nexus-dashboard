const validDate = (value) => typeof value === "string" && !Number.isNaN(Date.parse(value));
const amount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

export function buildRevenue(deals = [], resolveClient = (deal) => ({
  id: deal.clientId, type: deal.clientType, name: deal.clientName || "—", missing: true,
}), now = new Date()) {
  const wonDeals = deals
    .filter((deal) => deal.stage === "won" && validDate(deal.closedAt))
    .map((deal) => {
      const client = resolveClient(deal) || {};
      return {
        ...deal,
        revenueDate: new Date(deal.closedAt),
        revenueValue: amount(deal.value),
        client: {
          id: client.id || deal.clientId || deal.id,
          type: client.type || deal.clientType || "unknown",
          name: client.name || deal.clientName || "—",
          company: client.company || "",
          email: client.email || "",
          missing: Boolean(client.missing),
        },
      };
    })
    .sort((a, b) => b.revenueDate - a.revenueDate);

  const total = wonDeals.reduce((sum, deal) => sum + deal.revenueValue, 0);
  const inMonth = (deal, date) => deal.revenueDate.getFullYear() === date.getFullYear() && deal.revenueDate.getMonth() === date.getMonth();
  const thisMonth = wonDeals.filter((deal) => inMonth(deal, now));
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonth = wonDeals.filter((deal) => inMonth(deal, previousMonthDate));
  const thisYear = wonDeals.filter((deal) => deal.revenueDate.getFullYear() === now.getFullYear());

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return { date, key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, value: 0, count: 0 };
  });
  const monthMap = new Map(months.map((item) => [item.key, item]));
  wonDeals.forEach((deal) => {
    const key = `${deal.revenueDate.getFullYear()}-${String(deal.revenueDate.getMonth() + 1).padStart(2, "0")}`;
    const bucket = monthMap.get(key);
    if (bucket) { bucket.value += deal.revenueValue; bucket.count += 1; }
  });

  const byClient = new Map();
  wonDeals.forEach((deal) => {
    const client = deal.client;
    const key = `${client.type}:${client.id}`;
    const current = byClient.get(key) || { ...client, key, value: 0, count: 0, latestDate: deal.revenueDate };
    current.value += deal.revenueValue;
    current.count += 1;
    if (deal.revenueDate > current.latestDate) current.latestDate = deal.revenueDate;
    byClient.set(key, current);
  });
  const clients = [...byClient.values()].sort((a, b) => b.value - a.value);
  const previousTotal = previousMonth.reduce((sum, deal) => sum + deal.revenueValue, 0);
  const monthTotal = thisMonth.reduce((sum, deal) => sum + deal.revenueValue, 0);
  const change = previousTotal ? ((monthTotal - previousTotal) / previousTotal) * 100 : null;

  return {
    wonDeals, total, count: wonDeals.length,
    average: wonDeals.length ? total / wonDeals.length : 0,
    monthTotal, yearTotal: thisYear.reduce((sum, deal) => sum + deal.revenueValue, 0),
    monthCount: thisMonth.length, previousMonthTotal: previousTotal, monthChange: change,
    months, clients: clients.slice(0, 5), clientCount: clients.length,
    linkedDeals: wonDeals.filter((deal) => !deal.client.missing).length,
    unlinkedDeals: wonDeals.filter((deal) => deal.client.missing).length,
  };
}
