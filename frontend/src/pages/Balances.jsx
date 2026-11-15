import { Link, useOutletContext } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Avatar from "@/components/Avatar";
import RollingNumber from "@/components/RollingNumber";
import { useGet } from "@/lib/queries";
import { formatPesoShort } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Where you stand with each dormmate: your summary first, then everyone's card with their balance. */
export default function Balances() {
  const { me } = useOutletContext();
  const balances = useGet("/balances");
  const dorm = useGet("/dorms/current");
  if (!balances.data || !dorm.data) return null;

  const debtWith = (id) => balances.data.debts.find((d) => d.user.id === id);
  // Everyone in the dorm, plus anyone you still have money open with who is no longer in it
  const members = dorm.data.members.filter((m) => m.user.id !== me.id);
  const former = balances.data.debts.filter((d) => !members.some((m) => m.user.id === d.user.id)).map((d) => ({ user: d.user, role: null }));
  const mates = [...members, ...former];
  const net = balances.data.netCentavos;

  return (
    <div className="lg:max-w-[760px]">
      <PageHeader title="Balances" gear />
      <div className="space-y-6 px-5">
        <section aria-label="Your balance" className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-[13px] font-bold tracking-[0.06em] text-muted-foreground uppercase">Your balance</p>
          <p className={cn("mt-1 font-heading text-[32px] leading-none font-black tabular-nums", net > 0 ? "text-olive-ink" : net < 0 ? "text-orange-ink" : "")}>
            {net === 0 ? "All square" : <RollingNumber>{formatPesoShort(Math.abs(net))}</RollingNumber>}
          </p>
          <p className="mt-1.5 text-[14px] font-medium text-muted-foreground">
            {net > 0 ? "more is owed to you than you owe" : net < 0 ? "more than you're owed: time to settle up" : "nobody owes anybody"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5 text-[14px]">
            <span className="rounded-2xl bg-olive-soft px-3 py-2.5"><span className="block font-semibold text-olive-ink">Owed to you</span><span className="font-heading text-[18px] font-extrabold tabular-nums">{formatPesoShort(balances.data.owedToMeCentavos)}</span></span>
            <span className="rounded-2xl bg-orange-soft px-3 py-2.5"><span className="block font-semibold text-orange-ink">You owe</span><span className="font-heading text-[18px] font-extrabold tabular-nums">{formatPesoShort(balances.data.iOweCentavos)}</span></span>
          </div>
        </section>

        <section aria-labelledby="mates-title">
          <h2 id="mates-title" className="mb-2.5 px-1 font-heading text-[19px] font-extrabold">Your dormmates</h2>
          <ul className="space-y-2.5">
            {mates.map(({ user, role }) => {
              const debt = debtWith(user.id);
              const iOwe = debt?.direction === "I_OWE";
              return (
                <li key={user.id} className="flex min-h-[72px] items-center gap-3 rounded-2xl bg-card p-3 pl-4 shadow-[var(--shadow-card)]">
                  <Avatar user={user} className="size-11 text-[16px]" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5 text-[16px] font-bold">{user.displayName}{role === "CREATOR" && <span className="rounded-full bg-secondary px-2 py-0.5 text-[12px] font-semibold text-muted-foreground">Creator</span>}</span>
                    <span className={cn("block text-[14px] font-semibold tabular-nums", !debt ? "text-muted-foreground" : iOwe ? "text-orange-ink" : "text-olive-ink")}>
                      {!debt ? "Settled" : iOwe ? `You owe ${formatPesoShort(debt.amountCentavos)}` : `Owes you ${formatPesoShort(debt.amountCentavos)}`}
                    </span>
                  </span>
                  {iOwe && <Link to={`/payments/new?to=${user.id}`} className="flex h-11 shrink-0 items-center rounded-full bg-olive px-5 text-[15px] font-bold text-white">Pay</Link>}
                </li>
              );
            })}
            {!mates.length && <li className="rounded-3xl border border-dashed border-input px-6 py-8 text-center text-[15px] text-muted-foreground">No dormmates yet. Share your dorm's QR from Settings.</li>}
          </ul>
          <p className="mt-3 px-1 text-[13px] text-muted-foreground">Debts between two people cancel out, so you only see what's left.</p>
        </section>
      </div>
    </div>
  );
}
