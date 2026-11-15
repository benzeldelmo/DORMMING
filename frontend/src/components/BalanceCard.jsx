import { Link } from "react-router-dom";
import { formatPesoShort } from "@/lib/money";
import RollingNumber from "./RollingNumber";

const TONES = {
  olive: { box: "bg-olive-soft", chip: "bg-olive text-white", ink: "text-olive-ink" },
  orange: { box: "bg-orange-soft", chip: "bg-orange text-white", ink: "text-orange-ink" },
};

/** A big total: "Owed to you" or "You owe". Label on top, the amount large, a short caption under it. */
export function BalanceCard({ tone, icon: Icon, label, centavos, caption, to }) {
  const t = TONES[tone];
  const Box = to ? Link : "div";
  return (
    <Box to={to} className={`flex flex-col gap-2.5 rounded-3xl p-3.5 shadow-[var(--shadow-card)] xl:gap-4 xl:p-5 transition-transform active:scale-[0.98] ${t.box}`}>
      <span className="flex items-center gap-2 text-[14px] font-bold">
        <span className={`grid size-7 place-items-center rounded-full ${t.chip}`}><Icon aria-hidden className="size-4" strokeWidth={2.5} /></span>
        {label}
      </span>
      <span>
        <span className={`block font-heading text-[26px] leading-none font-extrabold xl:text-[34px] tracking-tight tabular-nums ${t.ink}`}><RollingNumber>{formatPesoShort(centavos)}</RollingNumber></span>
        <span className="mt-1.5 block text-[13px] font-medium text-foreground/75">{caption}</span>
      </span>
    </Box>
  );
}
