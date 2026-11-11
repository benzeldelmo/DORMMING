import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { BalanceCard } from "@/components/BalanceCard";
import { Empty } from "@/components/Rows";
import { useGet } from "@/lib/queries";
import { formatPeso } from "@/lib/money";

export default function Balances() {
  const { data } = useGet("/balances");
  return (
    <div>
      <PageHeader title="Balances" gear />
      {data && (
        <div className="space-y-5 px-5">
          <div className="grid grid-cols-2 gap-3">
            <BalanceCard tone="olive" icon={ArrowDownLeft} label="Owed to you" centavos={data.owedToMeCentavos} caption="To collect" to="/balances" />
            <BalanceCard tone="orange" icon={ArrowUpRight} label="You Owe" centavos={data.iOweCentavos} caption="To repay" to="/payments/new" />
          </div>
          <section>
            <h2 className="mb-2 px-1 font-heading text-[17px] font-bold">Who owes whom</h2>
            <ul className="space-y-2">
              {data.debts.map((d) => {
                const iOwe = d.direction === "I_OWE";
                return (
                  <li key={d.user.id + d.direction} className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${iOwe ? "bg-cream" : "bg-olive-soft/70"}`}>
                    <span className="grid size-10 place-items-center rounded-full bg-white font-semibold">{d.user.initials}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{d.user.displayName}</span>
                      <span className="text-xs text-muted-foreground">{iOwe ? "You owe" : "Owes you"}</span>
                    </span>
                    <span className={`font-heading text-lg font-bold tabular-nums ${iOwe ? "text-orange" : "text-olive"}`}>{formatPeso(d.amountCentavos)}</span>
                    {iOwe && <Link to={`/payments/new?to=${d.user.id}`} className="rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white">Pay</Link>}
                  </li>
                );
              })}
              {!data.debts.length && <Empty>Everyone's square. Ming approves.</Empty>}
            </ul>
          </section>
          <p className="px-1 text-xs text-muted-foreground">Debts between two people cancel out, so you only see what's left. Bills are paid to the provider and don't show here.</p>
        </div>
      )}
    </div>
  );
}
