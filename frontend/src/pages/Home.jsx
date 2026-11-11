import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, CreditCard, Settings } from "lucide-react";
import { BalanceCard } from "@/components/BalanceCard";
import GreetingCard from "@/components/GreetingCard";
import QuickActions from "@/components/QuickActions";
import SpendingCard from "@/components/SpendingCard";
import { ActivityRow, BillRow, Empty, SectionHeader } from "@/components/Rows";
import { useGet } from "@/lib/queries";

export default function Home() {
  const navigate = useNavigate();
  const { openAdd } = useOutletContext();
  const { data: home, error } = useGet("/home");

  if (error) return <p className="p-6 text-destructive">{error.message}</p>;
  if (!home) return <div className="p-6 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-5 px-5 pt-4 lg:space-y-6 lg:px-5 lg:pt-8">
      <div className="flex items-center justify-between lg:hidden">
        <img src="/brand/dormming-logo.png" alt="DormMing" className="h-8 w-auto" />
        <div className="flex gap-1">
          <Link to="/card" aria-label="My card" className="grid size-10 place-items-center rounded-full hover:bg-secondary"><CreditCard className="size-6" /></Link>
          <Link to="/settings" aria-label="Settings" className="grid size-10 place-items-center rounded-full hover:bg-secondary"><Settings className="size-6" /></Link>
        </div>
      </div>

      <GreetingCard me={home.me} dormName={home.dorm?.name} mood={home.mood} banner={home.banner} moodLine={home.moodLine} />
      <QuickActions />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:gap-6">
        <div className="space-y-5 lg:space-y-6">
          <section aria-label="Balances" className="grid grid-cols-2 gap-3">
            <BalanceCard tone="olive" icon={ArrowDownLeft} label="Owed to you" centavos={home.owedToMeCentavos} caption="To collect" to="/balances" />
            <BalanceCard tone="orange" icon={ArrowUpRight} label="You Owe" centavos={home.iOweCentavos} caption="To repay" to="/balances" />
          </section>
          <SpendingCard />
        </div>
        <div className="space-y-5 lg:space-y-6">
          <section>
            <SectionHeader title="Upcoming bills" to="/bills" />
            <div className="space-y-2">
              {home.upcomingBills.length ? home.upcomingBills.map((b) => <BillRow key={b.id} bill={b} onClick={() => navigate("/bills")} />)
                : <Empty>No bills coming up. <button type="button" onClick={() => navigate("/bills/new")} className="font-semibold text-olive">Set a reminder</button></Empty>}
            </div>
          </section>
          <section>
            <SectionHeader title="Recent activity" to="/activity" />
            <div className="space-y-2">
              {home.recent.length ? home.recent.map((a) => <ActivityRow key={a.id} item={a} />)
                : <Empty>Nothing yet. <button type="button" onClick={openAdd} className="font-semibold text-olive">Add your first record</button></Empty>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
