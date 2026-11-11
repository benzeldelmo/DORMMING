import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Settings } from "lucide-react";
import Ming from "@/components/Ming";
import { ActivityRow, BillRow, Empty, SectionHeader } from "@/components/Rows";
import { useGet } from "@/lib/queries";
import { formatPeso, formatPesoShort } from "@/lib/money";

function BalanceCard({ tone, icon: Icon, label, centavos, caption, to }) {
  const olive = tone === "olive";
  return (
    <Link to={to} className={`flex h-40 flex-col justify-between rounded-[22px] p-4 transition-transform active:scale-[0.98] ${olive ? "bg-olive-soft" : "bg-orange-soft"}`}>
      <span className="flex items-center gap-2 text-[13px] font-semibold">
        <span className={`grid size-6 place-items-center rounded-full ${olive ? "bg-olive/15 text-olive" : "bg-orange/15 text-orange"}`}><Icon className="size-3.5" strokeWidth={2.5} /></span>
        {label}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-heading text-[28px] font-extrabold leading-none tracking-tight tabular-nums">{formatPesoShort(centavos)}</span>
        <span className="whitespace-nowrap text-[11px] text-foreground/70">{caption}</span>
      </span>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { openAdd } = useOutletContext();
  const { data: home, error } = useGet("/home");

  if (error) return <p className="p-6 text-destructive">{error.message}</p>;
  if (!home) return <div className="p-6 text-muted-foreground">Loading…</div>;

  const firstName = home.me.displayName.split(" ")[0];
  return (
    <div className="px-5 pt-5">
      <div className="flex justify-end">
        <Link to="/settings" aria-label="Settings" className="grid size-10 place-items-center rounded-full hover:bg-secondary"><Settings className="size-6" /></Link>
      </div>

      <section aria-label="Ming" className="relative mt-1">
        <div className="flex items-end">
          <button type="button" onClick={() => navigate("/assistant")} aria-label={`Chat with ${home.me.mingName}`} className="relative z-10 -mb-16 w-[44%] shrink-0">
            <Ming mood={home.mood} name={home.me.mingName} className="w-full" />
          </button>
          <div className="pb-3 pl-1">
            <h1 className="font-heading text-[30px] font-extrabold leading-none">Hi, {firstName}!</h1>
            <p className="mt-1 text-[11px] text-foreground/70">I am {home.me.mingName.toUpperCase()}! Your Digital Dorm Companion.</p>
          </div>
        </div>
        <Link to={home.banner ? "/bills" : "/balances"}
          className="flex min-h-[104px] items-center rounded-[22px] bg-olive py-4 pr-4 pl-[44%] shadow-[0_10px_24px_-14px_rgb(36_7_2/0.6)]">
          <span>
            <span className="sticker-text block font-heading text-[22px] font-extrabold leading-[1.05]">
              {home.banner ? home.banner.text : home.moodLine}
            </span>
            {home.banner && <span className="mt-1 block text-[11px] text-white/85">Your share: {formatPeso(home.banner.myShareCentavos)}</span>}
          </span>
        </Link>
      </section>

      <section aria-label="Balances" className="mt-4 grid grid-cols-2 gap-3">
        <BalanceCard tone="olive" icon={ArrowDownLeft} label="Owed to you" centavos={home.owedToMeCentavos} caption="To collect" to="/balances" />
        <BalanceCard tone="orange" icon={ArrowUpRight} label="You Owe" centavos={home.iOweCentavos} caption="To repay" to="/balances" />
      </section>

      <section className="mt-6">
        <SectionHeader title="Upcoming bills" to="/bills" />
        <div className="space-y-2">
          {home.upcomingBills.length ? home.upcomingBills.map((b) => <BillRow key={b.id} bill={b} onClick={() => navigate("/bills")} />)
            : <Empty>No bills coming up. <button type="button" onClick={() => navigate("/bills/new")} className="font-semibold text-olive">Set a reminder</button></Empty>}
        </div>
      </section>

      <section className="mt-6">
        <SectionHeader title="Recent activities" to="/activity" />
        <div className="space-y-2">
          {home.recent.length ? home.recent.map((a) => <ActivityRow key={a.id} item={a} />)
            : <Empty>Nothing yet. <button type="button" onClick={openAdd} className="font-semibold text-olive">Add your first record</button></Empty>}
        </div>
      </section>
    </div>
  );
}
