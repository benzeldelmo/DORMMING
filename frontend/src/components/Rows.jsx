import { Link } from "react-router-dom";
import { categoryById } from "@/lib/categories";
import { formatPesoShort } from "@/lib/money";
import Sentences from "./Sentences";

/** One expense in a list: category icon, title, who shared it, and the amount. Opens with `onClick`, or links with `to`. */
export function ExpenseRow({ title, subtitle, category, amountCentavos, onClick, to }) {
  const Icon = categoryById(category).icon;
  const Box = to ? Link : "button";
  return (
    <Box to={to} type={to ? undefined : "button"} onClick={onClick} className="flex min-h-[64px] w-full items-center gap-3 rounded-2xl bg-card px-3 py-2.5 text-left shadow-[var(--shadow-card)]">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-olive-soft text-olive-ink"><Icon aria-hidden className="size-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-tight text-pretty">{title}</span>
        <Sentences className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{subtitle}</Sentences>
      </span>
      <span className="font-heading text-[17px] font-extrabold tabular-nums">{formatPesoShort(amountCentavos).replace(/\.00$/, "")}</span>
    </Box>
  );
}

/** An empty list: a short line and an optional action. (Ming appears only in Home's greeting.) */
export function Empty({ children }) {
  return <div className="rounded-3xl border border-dashed border-input px-6 py-8 text-center text-[15px] text-muted-foreground">{children}</div>;
}
