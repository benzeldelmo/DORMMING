import { Link, useOutletContext } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, BellRing, HandCoins, Settings, ShoppingBag } from "lucide-react";
import GreetingCard from "@/components/GreetingCard";
import Avatar from "@/components/Avatar";
import { BalanceCard } from "@/components/BalanceCard";
import { Empty, ExpenseRow } from "@/components/Rows";
import { useGet } from "@/lib/queries";
import { moodFor } from "@/lib/mood";
import { getRemindDays } from "@/lib/prefs";
import { sharedLine } from "@/lib/people";
import { formatPesoShort } from "@/lib/money";
import { daysUntil, dueLabel } from "@/lib/dates";

const DAY = new Intl.DateTimeFormat("en-PH", { weekday: "long", month: "long", day: "numeric" });
const SHORT_DAY = new Intl.DateTimeFormat("en-PH", { weekday: "short", month: "short", day: "numeric" });
const TIME = new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit" });
const greeting = (h) => (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");

const SHORT_DATE = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric" });
const dayOf = (iso) => { const [y, m, d] = iso.split("-").map(Number); return SHORT_DATE.format(new Date(y, m - 1, d)); };
const QUICK = [
  { to: "/expenses/new", icon: ShoppingBag, label: "Add expense" },
  { to: "/balances", icon: HandCoins, label: "Pay back" },
  { to: "/bills/new", icon: BellRing, label: "Set a reminder" },
];
const Card = ({ className, ...props }) => <div className={`rounded-3xl bg-card shadow-[var(--shadow-card)] ${className ?? ""}`} {...props} />;

/**
 * Home. Phone: your dorm as a pill by Settings, the greeting, Ming's message, your two totals, the latest expenses.
 * Laptop (xl): a two-column board in matching rows: Ming's card beside your dorm (same height), your
 * totals beside your next bill (same height), then quick actions and the latest expenses.
 */
export default function Home() {
  const { me, dorm, openAdd, isDesktop } = useOutletContext();
  const balances = useGet("/balances");
  const expenses = useGet("/expenses");
  const bills = useGet("/bills");
  if (!balances.data || !expenses.data) return null;
  const { mood, line, to: mingTo } = moodFor(balances.data, expenses.data.length, bills.data ?? [], new Date(), getRemindDays());
  const recent = expenses.data.slice(0, isDesktop ? 4 : 3);
  const now = new Date();
  const net = balances.data.netCentavos;
  const nextBill = bills.data?.[0];

  return (
    <div className="space-y-5 px-5 pt-2 lg:space-y-6 lg:pt-8">
      <header>
        <div className="flex h-11 items-center justify-between">
          <p className="text-[13px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
            {/* Phone: the short date (the phone shows the time); laptop: the full date and time */}
            <time dateTime={now.toISOString()}><span className="lg:hidden">{SHORT_DAY.format(now)}</span><span className="hidden lg:inline">{DAY.format(now)} · {TIME.format(now)}</span></time>
          </p>
          <span className="flex items-center gap-1 lg:hidden">
            {/* Phone: your dorm as a small pill beside Settings */}
            {dorm && (
              <Link to="/settings" aria-label={`${dorm.name}, ${dorm.members.length} members`} className="flex h-9 max-w-[200px] items-center gap-2 rounded-full bg-card py-1 pr-3.5 pl-1 shadow-[var(--shadow-card)]">
                <span className="flex shrink-0 -space-x-1.5" aria-hidden>
                  {dorm.members.slice(0, 3).map((m) => <Avatar key={m.user.id} user={m.user} className="size-7 text-[11px] ring-2 ring-card" />)}
                </span>
                <span className="min-w-0 truncate text-[14px] font-bold">{dorm.name}</span>
              </Link>
            )}
            <Link to="/settings" aria-label="Settings" className="-mr-2.5 grid size-11 place-items-center rounded-full hover:bg-secondary"><Settings className="size-[22px]" /></Link>
          </span>
        </div>
        <h1 className="font-heading text-[27px] leading-tight font-black tracking-tight text-balance lg:text-[30px]">{greeting(now.getHours())}, {me.displayName.split(" ")[0]}!</h1>
      </header>

      {/* Laptop (xl): a 2-column board in matching rows. Row 1: Ming's card and your dorm, the same height.
          Row 2: your totals and your next bill, the same height. Then quick actions and recent expenses.
          Phone: one column (Ming, totals, dorm, recent). */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-x-6 xl:gap-y-5">
        <GreetingCard mood={mood} line={line} to={mingTo} />

        {/* Your dorm on a laptop: a slim card (on a phone it's the pill at the top). On a laptop it shares its height and bottom
            edge with Ming's green band beside it. */}
        {dorm && (
          <Link to="/settings" className="hidden items-center justify-between gap-3 rounded-3xl bg-card p-4 shadow-[var(--shadow-card)] lg:flex xl:h-[88px] xl:self-end xl:px-5">
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-muted-foreground">Your dorm · {dorm.members.length} members</span>
              <span className="mt-0.5 block font-heading text-[19px] leading-tight font-extrabold break-words">{dorm.name}</span>
            </span>
            <span className="flex shrink-0 -space-x-2" aria-hidden>
              {dorm.members.map((m) => <Avatar key={m.user.id} user={m.user} className="size-9 text-[13px] ring-2 ring-card" />)}
            </span>
          </Link>
        )}

        <section aria-label="Balances" className="grid grid-cols-2 gap-3 xl:gap-4">
          <BalanceCard tone="olive" icon={ArrowDownLeft} label="Owed to you" centavos={balances.data.owedToMeCentavos} caption="To collect" to="/balances" />
          <BalanceCard tone="orange" icon={ArrowUpRight} label="You owe" centavos={balances.data.iOweCentavos} caption="To repay" to="/balances" />
        </section>

        <Card className="hidden flex-col justify-between gap-3 p-5 xl:flex">
          <span className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-muted-foreground">Next bill</span>
            {nextBill && <span className={`rounded-full px-2.5 py-1 text-[13px] font-bold ${daysUntil(nextBill.dueDate) <= getRemindDays() ? "bg-orange-soft text-orange-ink" : "bg-secondary text-muted-foreground"}`}>{dueLabel(nextBill.dueDate)}</span>}
          </span>
          {nextBill ? (
            <Link to="/bills" className="flex items-end justify-between gap-3 rounded-xl">
              <span className="min-w-0">
                <span className="block font-heading text-[20px] leading-tight font-extrabold break-words">{nextBill.name}</span>
                <span className="block text-[14px] font-medium text-muted-foreground">{nextBill.monthly ? "Every month" : "One time"}</span>
              </span>
              <span className="font-heading text-[30px] leading-none font-extrabold tabular-nums">{formatPesoShort(nextBill.amountCentavos)}</span>
            </Link>
          ) : (
            <p className="text-[15px] text-muted-foreground">No bills coming up. <Link to="/bills/new" className="font-bold text-olive-ink">Set a reminder</Link></p>
          )}
        </Card>

        {/* Laptop: where you stand overall, and the three things people do most, one click each */}
        <div className="hidden items-center justify-between gap-4 xl:col-span-2 xl:flex">
          <p className="px-1 text-[15px] font-semibold text-muted-foreground">
            {net === 0 ? "Overall, you're all square." : net > 0 ? <>Overall, you're <span className="text-olive-ink">{formatPesoShort(net)} ahead</span>.</> : <>Overall, you're <span className="text-orange-ink">{formatPesoShort(-net)} behind</span>.</>}
          </p>
          <nav aria-label="Quick actions" className="flex gap-2">
            {QUICK.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="m-btn m-btn--quiet flex h-10 items-center gap-2 rounded-full bg-card px-4 text-[14px] font-bold shadow-[var(--shadow-card)]">
                <Icon aria-hidden className="size-4 text-olive-ink" />{label}
              </Link>
            ))}
          </nav>
        </div>

        <section aria-labelledby="recent-title" className="xl:col-span-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 id="recent-title" className="font-heading text-[18px] font-extrabold">Recent expenses</h2>
            {recent.length > 0 && <Link to="/expenses" className="-mr-2 flex h-11 items-center px-2 text-[14px] font-bold text-olive-ink">See all</Link>}
          </div>
          {recent.length ? (
            <div className="space-y-2 xl:grid xl:grid-cols-2 xl:gap-3 xl:space-y-0">
              {recent.map((e) => <ExpenseRow key={e.id} title={e.note || e.categoryLabel} category={e.category}
                subtitle={isDesktop ? `${dayOf(e.date)} • ${sharedLine(e, me.id)}` : sharedLine(e, me.id)} amountCentavos={e.amountCentavos} to={`/expenses?open=${e.id}`} />)}
            </div>
          ) : (
            <Empty>Nothing yet. <button type="button" onClick={openAdd} className="font-bold text-olive-ink underline underline-offset-4">Add your first expense</button></Empty>
          )}
        </section>
      </div>
    </div>
  );
}
