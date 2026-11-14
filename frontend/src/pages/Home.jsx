import { Link, useOutletContext } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Settings } from "lucide-react";
import GreetingCard from "@/components/GreetingCard";
import { BalanceCard } from "@/components/BalanceCard";
import { Empty, ExpenseRow } from "@/components/Rows";
import { useGet } from "@/lib/queries";
import { moodFor } from "@/lib/mood";
import { sharedLine } from "@/lib/people";

const DAY = new Intl.DateTimeFormat("en-PH", { weekday: "long", month: "long", day: "numeric" });
const TIME = new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit" });
const greeting = (h) => (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");

/** Home: the date and greeting, Ming's message, your two totals, and the latest expenses. */
export default function Home() {
  const { me, dorm, openAdd } = useOutletContext();
  const balances = useGet("/balances");
  const expenses = useGet("/expenses");
  if (!balances.data || !expenses.data) return null;
  const { mood, line } = moodFor(balances.data, expenses.data.length);
  const recent = expenses.data.slice(0, 5);

  const now = new Date();
  return (
    <div className="space-y-6 px-5 pt-3 lg:pt-8">
      <header>
        <div className="flex h-11 items-center justify-between">
          <p className="text-[13px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
            <time dateTime={now.toISOString()}>{DAY.format(now)} · {TIME.format(now)}</time>
          </p>
          <Link to="/settings" aria-label="Settings" className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-secondary lg:hidden"><Settings className="size-6" /></Link>
        </div>
        <h1 className="mt-1 font-heading text-[30px] leading-tight font-black tracking-tight text-balance lg:text-[36px]">{greeting(now.getHours())}, {me.displayName.split(" ")[0]}!</h1>
        {dorm && <p className="mt-0.5 text-[15px] font-medium text-muted-foreground">{dorm.name}</p>}
      </header>

      <GreetingCard mood={mood} line={line} />

      <div className="grid gap-5 lg:grid-cols-[1fr_400px] lg:gap-6">
        <section aria-label="Balances" className="grid grid-cols-2 gap-3 self-start">
          <BalanceCard tone="olive" icon={ArrowDownLeft} label="Owed to you" centavos={balances.data.owedToMeCentavos} caption="To collect" to="/balances" />
          <BalanceCard tone="orange" icon={ArrowUpRight} label="You owe" centavos={balances.data.iOweCentavos} caption="To repay" to="/balances" />
        </section>
        <section aria-labelledby="recent-title">
          <div className="mb-2 flex items-baseline justify-between px-1">
            <h2 id="recent-title" className="font-heading text-[19px] font-extrabold">Recent expenses</h2>
            {recent.length > 0 && <Link to="/expenses" className="text-[15px] font-bold text-olive-ink">See all</Link>}
          </div>
          {recent.length ? (
            <div className="space-y-2">
              {recent.map((e) => <ExpenseRow key={e.id} title={e.note || e.categoryLabel} category={e.category} subtitle={sharedLine(e, me.id)} amountCentavos={e.amountCentavos} to="/expenses" />)}
            </div>
          ) : (
            <Empty>Nothing yet. <button type="button" onClick={openAdd} className="font-semibold text-olive">Add your first expense</button></Empty>
          )}
        </section>
      </div>
    </div>
  );
}
