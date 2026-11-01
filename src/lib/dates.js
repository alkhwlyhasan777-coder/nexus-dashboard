/* Calendar dates as "YYYY-MM-DD" strings in the user's local time (what <input type="date"> uses). */
const pad = (n) => String(n).padStart(2, "0");

export const toISODate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseISODate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (iso, n) => {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

/* Whole days from one date to another (negative when `to` is earlier) */
export const daysBetween = (from, to) => Math.round((parseISODate(to) - parseISODate(from)) / 86400000);

/* True only for real calendar dates: "2030-02-31" and "soon" are rejected */
export const isValidDate = (iso) =>
  typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso) && toISODate(parseISODate(iso)) === iso;