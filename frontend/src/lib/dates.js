/** Today's date as YYYY-MM-DD in the viewer's time zone. */
export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const SHORT = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric" });

/** Whole days from today to a YYYY-MM-DD date (negative when it has passed). */
export function daysUntil(iso, today = new Date()) {
  const [y, m, d] = iso.split("-").map(Number);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((new Date(y, m - 1, d) - start) / 86400000);
}

/** "Overdue", "Due today", "Due tomorrow", "Due in 5 days", then "Due Dec 3" past a week. */
export function dueLabel(iso, today = new Date()) {
  const days = daysUntil(iso, today);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days} days`;
  const [y, m, d] = iso.split("-").map(Number);
  return `Due ${SHORT.format(new Date(y, m - 1, d))}`;
}
