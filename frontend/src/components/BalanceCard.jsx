import { Link } from "react-router-dom";
import { formatPesoShort } from "@/lib/money";

/** A big total: "Owed to you" or "You owe". Tappable when `to` is given. */
export function BalanceCard({ tone, icon: Icon, label, centavos, caption, to }) {
  const olive = tone === "olive";
  const Box = to ? Link : "div";
  return (
    <Box to={to} className={`flex h-40 flex-col justify-between rounded-[22px] p-4 transition-transform active:scale-[0.98] ${olive ? "bg-olive-soft" : "bg-orange-soft"}`}>
      <span className="flex items-center gap-2 text-[13px] font-semibold">
        <span className={`grid size-6 place-items-center rounded-full ${olive ? "bg-olive/15 text-olive" : "bg-orange/15 text-orange"}`}><Icon className="size-3.5" strokeWidth={2.5} /></span>
        {label}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-heading text-[28px] font-extrabold leading-none tracking-tight tabular-nums">{formatPesoShort(centavos)}</span>
        <span className="whitespace-nowrap text-[11px] text-foreground/70">{caption}</span>
      </span>
    </Box>
  );
}
