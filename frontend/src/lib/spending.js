import { categoryById } from "./categories";

/** This month's shared spending: the total, and the top 3 categories by amount. */
export function monthSummary(expenses, today = new Date()) {
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`; // local month, e.g. "2026-11"
  const byCategory = {};
  let total = 0;
  for (const e of expenses) {
    if (!e.date?.startsWith(month)) continue;
    total += e.amountCentavos;
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amountCentavos;
  }
  const top = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, centavos]) => ({ id, label: categoryById(id).label, centavos }));
  return { total, top };
}
