import { categoryById } from "@/lib/categories";
import { formatPeso } from "@/lib/money";

/** One expense in a list: category icon, title, who shared it, and the amount. */
export function ExpenseRow({ title, subtitle, category, amountCentavos, onClick }) {
  const Icon = categoryById(category).icon;
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-card px-3 py-3 text-left shadow-[var(--shadow-card)]">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-foreground/80"><Icon className="size-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-semibold leading-tight">{title}</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <span className="font-heading text-lg font-bold tabular-nums">{formatPeso(amountCentavos).replace(/\.00$/, "")}</span>
    </button>
  );
}

/** Dashed box for an empty list. */
export function Empty({ children }) {
  return <p className="rounded-2xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">{children}</p>;
}
