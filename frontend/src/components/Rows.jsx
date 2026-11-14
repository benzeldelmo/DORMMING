import { Link } from "react-router-dom";
import { categoryById } from "@/lib/categories";
import { formatPeso } from "@/lib/money";

/** One expense in a list: category icon, title, who shared it, and the amount. Opens with `onClick`, or links with `to`. */
export function ExpenseRow({ title, subtitle, category, amountCentavos, onClick, to }) {
  const Icon = categoryById(category).icon;
  const Box = to ? Link : "button";
  return (
    <Box to={to} type={to ? undefined : "button"} onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-card px-3 py-3 text-left shadow-[var(--shadow-card)]">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-foreground/80"><Icon className="size-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-semibold leading-tight">{title}</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <span className="font-heading text-lg font-bold tabular-nums">{formatPeso(amountCentavos).replace(/\.00$/, "")}</span>
    </Box>
  );
}

/** An empty list: a short line and an optional action. (Ming appears only in Home's greeting.) */
export function Empty({ children }) {
  return <div className="rounded-3xl border border-dashed border-input px-6 py-8 text-center text-[15px] text-muted-foreground">{children}</div>;
}
