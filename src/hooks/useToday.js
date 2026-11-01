import { useEffect, useState } from "react";

import { toISODate } from "../lib/dates";

/* Today's date ("YYYY-MM-DD"). It refreshes by itself, so "overdue" and "this month" stay correct
   even if the page is left open past midnight. */
export default function useToday() {
  const [today, setToday] = useState(() => toISODate());
  useEffect(() => {
    const id = setInterval(() => setToday(toISODate()), 60000);
    return () => clearInterval(id);
  }, []);
  return today;
}