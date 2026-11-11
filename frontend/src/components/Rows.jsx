import { ArrowLeftRight } from "lucide-react";
import { billIcon, categoryById } from "@/lib/categories";
import { formatPeso } from "@/lib/money";
import { cn } from "@/lib/utils";

const DAY = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" });
const WEEKDAY = new Intl.DateTimeFormat("en-US", { weekday: "long" });

export function dueLabel(dueDate, overdue) {
  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((due - today) / 86400000);
  if (overdue || days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${DAY.format(due)} • ${WEEKDAY.format(due)}`;
}

/** Cream row with an orange icon tile, like Upcoming bills in the mockup. */
export function BillRow({ bill, onClick }) {
  const Icon = billIcon(bill.name, bill.category);
  const label = dueLabel(bill.dueDate, bill.overdue);
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-cream px-3 py-3 text-left transition-colors hover:bg-orange-soft/70">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-soft text-[#f08a2c]"><Icon className="size-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-semibold leading-tight">{bill.name}</span>
        <span className={cn("block text-xs", label === "Overdue" ? "font-semibold text-orange" : "text-muted-foreground")}>
          {label}{bill.myShareCentavos != null && ` • Your share ${formatPeso(bill.myShareCentavos)}`}
        </span>
      </span>
      <span className="font-heading text-lg font-bold text-[#f08a2c] tabular-nums">{formatPeso(bill.amountCentavos).replace(/\.00$/, "")}</span>
    </button>
  );
}

/** Gray row with an icon, title, one-line subline and amount. */
export function ActivityRow({ item, onClick }) {
  const Icon = item.type === "PAYMENT" ? ArrowLeftRight : item.type === "BILL" ? billIcon(item.title, item.category) : categoryById(item.category).icon;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-secondary px-3 py-3 text-left">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/80 text-foreground/80"><Icon className="size-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-semibold leading-tight">{item.title}</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">{item.subtitle ?? item.text}</span>
      </span>
      <span className="font-heading text-lg font-bold tabular-nums">{formatPeso(item.amountCentavos).replace(/\.00$/, "")}</span>
    </Tag>
  );
}

export function SectionHeader({ title, to, linkLabel = "See all" , onLink }) {
  return (
    <div className="mb-2 flex items-baseline justify-between px-1">
      <h2 className="font-heading text-[17px] font-bold">{title}</h2>
      {(to || onLink) && <a href={to} onClick={onLink} className="text-xs text-muted-foreground hover:text-foreground">{linkLabel} ›</a>}
    </div>
  );
}

export function Empty({ children }) {
  return <p className="rounded-2xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">{children}</p>;
}
