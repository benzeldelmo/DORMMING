import { categoryById } from "@/lib/categories";
import { formatPeso } from "@/lib/money";
import { useGet } from "@/lib/queries";

const FILLS = ["bg-olive", "bg-orange", "bg-[#e9b949]", "bg-[#a2a690]", "bg-[#c9c6bb]"];

/** What the dorm spent this month, by category, against last month. */
export default function SpendingCard() {
  const { data } = useGet("/spending");
  if (!data) return <section className="card-surface h-56 animate-pulse" />;
  const top = data.byCategory.slice(0, 4);
  const rest = data.byCategory.slice(4).reduce((s, c) => s + c.totalCentavos, 0);
  const rows = rest ? [...top, { category: "OTHERS", label: "Others", totalCentavos: rest }] : top;
  const diff = data.totalCentavos - data.previousTotalCentavos;
  const month = new Date(`${data.month}-01T00:00:00`).toLocaleString("en-US", { month: "long" });

  return (
    <section aria-label="Dorm spending" className="card-surface p-5">
      <p className="text-[13px] font-semibold text-muted-foreground">Dorm spent in {month}</p>
      <p className="mt-1 text-[32px] leading-none font-extrabold tracking-tight tabular-nums">{formatPeso(data.totalCentavos)}</p>
      <p className={`mt-1.5 text-[13px] font-semibold ${diff > 0 ? "text-orange" : "text-olive"}`}>
        {diff === 0 ? "Same as last month" : `${formatPeso(Math.abs(diff)).replace(/\.00$/, "")} ${diff > 0 ? "more" : "less"} than last month`}
      </p>
      {rows.length ? (
        <ul className="mt-5 space-y-3.5">
          {rows.map((c, i) => {
            const Icon = categoryById(c.category).icon;
            return (
              <li key={c.label}>
                <div className="flex items-center gap-2.5 text-sm">
                  <Icon className="size-4 text-foreground/60" />
                  <span className="flex-1 font-medium">{c.label}</span>
                  <span className="font-semibold tabular-nums">{formatPeso(c.totalCentavos)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${FILLS[i]}`} style={{ width: `${Math.max(3, (c.totalCentavos / data.totalCentavos) * 100)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">No dorm spending yet this month. Add an expense and it shows up here.</p>
      )}
    </section>
  );
}
