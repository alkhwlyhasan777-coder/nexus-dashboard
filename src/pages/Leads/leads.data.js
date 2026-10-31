/* Constants, seed data and pure helpers for the Leads page. No React in here. */

export const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"];
export const SOURCES = ["website", "referral", "linkedin", "ads", "email", "event", "cold"];
export const STATUS_TONE = { new: "blue", contacted: "violet", qualified: "amber", proposal: "cyan", won: "emerald", lost: "red" };

const DAY = 86400000;
const DIAL = ["+20 10", "+966 5", "+971 50", "+44 7700", "+1 415", "+49 151"];

// name, company, source, status, value (USD), created N days ago, optional email name, optional note
const ROWS = [
  ["Karim Nabil", "Orion Tech", "website", "new", 4200, 1],
  ["Mona Fathy", "Cairo Retail", "referral", "contacted", 8800, 4],
  ["Daniel Foster", "Foster & Sons", "linkedin", "qualified", 15000, 9, null, "Interested in the annual plan. Follow up after their board meeting."],
  ["سارة عادل", "Nile Events", "event", "proposal", 22000, 14, "sara.adel", "Met at the trade show. Proposal sent, waiting for budget approval."],
  ["Omar Zaki", "ZK Logistics", "ads", "new", 3100, 2],
  ["Rachel Green", "Brightside Media", "email", "won", 18500, 40, null, "Signed a 12-month contract."],
  ["Hassan Ali", "Delta Steel", "cold", "lost", 9600, 33, null, "Went with a cheaper competitor."],
  ["Nadine Farouk", "Lotus Spa", "website", "contacted", 2700, 6],
  ["Peter Hughes", "Hughes Legal", "referral", "qualified", 12400, 11],
  ["Aisha Rahman", "Crescent Foods", "linkedin", "proposal", 31000, 17, null, "Wants a custom onboarding package."],
  ["Mahmoud Selim", "Selim Auto", "ads", "contacted", 5400, 5],
  ["Olivia Clarke", "Clarke Design", "website", "new", 1900, 0],
  ["Youssef Gamal", "Gamal Pharma", "event", "won", 26800, 55],
  ["Laura Meyer", "Meyer GmbH", "email", "qualified", 14200, 21],
  ["Tamer Ashraf", "Ashraf Group", "cold", "new", 3600, 3],
  ["أحمد منير", "Munir Trading", "referral", "contacted", 7300, 8, "ahmed.munir"],
  ["Sophia Lang", "Lang Studio", "website", "lost", 2100, 48],
  ["Khaled Idris", "Idris Builders", "linkedin", "proposal", 19900, 19],
  ["Emma Walker", "Walker Health", "ads", "contacted", 6100, 10],
  ["Ramy Sobhy", "Sobhy Tech", "event", "qualified", 11800, 26],
  ["Hala Mostafa", "Hala Boutique", "website", "won", 4800, 62],
  ["Victor Chen", "Chen Imports", "email", "new", 5200, 1],
  ["Nesma Hegazy", "Hegazy Dental", "referral", "proposal", 9300, 13],
  ["Adam Brooks", "Brooks Capital", "linkedin", "contacted", 28000, 7],
  ["Dalia Wahba", "Wahba Textiles", "cold", "lost", 3900, 71],
  ["Samir Fouad", "Fouad Marine", "ads", "qualified", 13700, 29],
  ["Julia Becker", "Becker AG", "website", "new", 8200, 2],
  ["Ehab Lotfy", "Lotfy Foods", "event", "contacted", 4400, 12],
  ["Mariam Tarek", "Tarek & Co", "referral", "won", 16700, 80],
  ["Noah Fischer", "Fischer Tools", "email", "qualified", 10200, 16],
  ["Rania Helmy", "Helmy Clinics", "linkedin", "new", 6900, 4],
  ["George Mitchell", "Mitchell Realty", "ads", "proposal", 24500, 23],
];

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");

export function buildSeed() {
  const now = Date.now();
  return ROWS.map(([name, company, source, status, value, daysAgo, emailName, notes], i) => {
    const createdAt = new Date(now - daysAgo * DAY).toISOString();
    const n = 2000000 + ((i * 137531) % 7000000);
    const activity = [{ type: "created", at: createdAt }];
    if (status !== "new") {
      activity.push({ type: "status", from: "new", to: status, at: new Date(now - Math.max(0, daysAgo - 2) * DAY).toISOString() });
    }
    return {
      id: `lead-${i + 1}`,
      name, company, source, status, value, createdAt,
      email: `${emailName || slug(name) || `lead${i}`}@${slug(company).replace(/\./g, "")}.example`,
      phone: `${DIAL[i % DIAL.length]} ${String(n).slice(0, 3)} ${String(n).slice(3, 7)}`,
      notes: notes ?? "",
      activity,
    };
  });
}

/* Summary numbers for the stat cards */
export function computeStats(leads) {
  const now = Date.now();
  const open = leads.filter((l) => l.status !== "won" && l.status !== "lost");
  const won = leads.filter((l) => l.status === "won").length;
  const lost = leads.filter((l) => l.status === "lost").length;
  return {
    total: leads.length,
    openCount: open.length,
    pipeline: open.reduce((sum, l) => sum + l.value, 0),
    won, lost,
    winRate: won + lost ? won / (won + lost) : 0,
    newThisWeek: leads.filter((l) => now - new Date(l.createdAt).getTime() <= 7 * DAY).length,
  };
}