import { isoInDays } from "@/lib/dates";
import { Link, Navigate } from "react-router-dom";
import { CalendarDays, ShieldCheck, ShoppingBasket, Wallet } from "lucide-react";
import HeroDemo from "@/landing/HeroDemo";
import DesktopDemo from "@/landing/DesktopDemo";
import MingBust from "@/components/MingBust";
import ThermalReceipt from "@/components/ThermalReceipt";
import { BillRow } from "@/components/Rows";
import { isLoggedIn } from "@/lib/auth";

const Chip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-olive-soft px-2.5 py-0.5 align-[2px] text-[0.9em] font-semibold text-olive">
    <Icon className="size-[0.95em]" />{children}
  </span>
);

const NAMES = { a: "Me", b: "Vince", c: "Sydney" };
const RECEIPT_ITEMS = [{ name: "Samgyup set", priceCentavos: 90000, sharerIds: ["a", "b", "c"] }, { name: "Iced tea", priceCentavos: 15000, sharerIds: ["b"] }];

function FeatureCard({ title, text, children }) {
  return (
    <article className="card-surface flex flex-col overflow-hidden">
      <div className="relative h-[230px] overflow-hidden bg-[#efeee8] px-6 pt-6" aria-hidden>{children}</div>
      <div className="p-6">
        <h3 className="text-xl font-extrabold">{title}</h3>
        <p className="mt-1 text-[15px] text-foreground/65">{text}</p>
      </div>
    </article>
  );
}

export default function Landing() {
  if (isLoggedIn()) return <Navigate to="/home" replace />;
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <img src="/brand/dormming-logo.png" alt="DormMing" className="h-9 w-auto sm:h-10" />
        <nav className="flex items-center gap-1 text-[15px] font-semibold sm:gap-2">
          <a href="#features" className="hidden rounded-full px-3 py-2 text-foreground/70 hover:text-foreground sm:block">Features</a>
          <a href="#how" className="hidden rounded-full px-3 py-2 text-foreground/70 hover:text-foreground sm:block">How it works</a>
          <Link to="/login" className="rounded-full px-3 py-2 hover:bg-white">Log in</Link>
          <Link to="/signup" className="rounded-full bg-[#1c1b17] px-4 py-2 text-white">Sign up</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-8 pb-14 sm:px-8 lg:grid-cols-[1fr_440px] lg:pt-14">
        <div className="max-w-xl">
          <h1 className="text-[46px] leading-[1] font-extrabold tracking-[-0.03em] text-balance sm:text-[64px]">
            Your dorm's <span className="sticker-text">gastos</span>, sorted.
          </h1>
          <p className="mt-6 text-lg leading-[1.9] text-foreground/75">
            Split <Chip icon={ShoppingBasket}>groceries</Chip>, track <Chip icon={CalendarDays}>bills</Chip>, and see{" "}
            <Chip icon={Wallet}>who owes whom</Chip>, with Ming keeping count. No more group chat math.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/signup" className="flex h-12 items-center rounded-2xl bg-olive px-6 text-[17px] font-bold text-white shadow-[0_8px_20px_-10px_rgb(36_7_2/0.5)]">Get started, it's free</Link>
            <Link to="/login" className="flex h-12 items-center rounded-2xl bg-white px-6 text-[17px] font-bold shadow-[var(--shadow-card)]">Log in</Link>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-foreground/60"><ShieldCheck className="size-4" />Simulated banking only. No real money moves.</p>
        </div>
        <div className="relative mx-auto w-full max-w-[440px]">
          <MingBust className="absolute -top-16 -right-4 z-10 hidden w-[120px] rotate-[8deg] sm:block" />
          <HeroDemo />
        </div>
      </section>

      <section id="features" aria-labelledby="features-title" className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <h2 id="features-title" className="max-w-2xl text-[32px] leading-tight font-extrabold tracking-tight sm:text-[40px]">Everything your dorm spends on, in one place.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <FeatureCard title="Split a receipt" text="Itemize who had what. Tax and tips are shared fairly, to the centavo.">
            <div className="mx-auto w-[260px] scale-[0.92] origin-top">
              <ThermalReceipt title="Samgyup night" dormName="Mabini Hall 3B" items={RECEIPT_ITEMS} extras={0} total={105000}
                shares={{ a: 30000, b: 45000, c: 30000 }} nameOf={(id) => NAMES[id]} payerName="Me" />
            </div>
          </FeatureCard>
          <FeatureCard title="Bills and reminders" text="Internet, water, rent. See your share and get reminded before it's due.">
            <div className="space-y-2.5 pt-6">
              <BillRow bill={{ name: "Internet", category: "INTERNET_LOAD", amountCentavos: 150000, dueDate: isoInDays(1), myShareCentavos: 50000 }} />
              <BillRow bill={{ name: "Water", category: "RENT_UTILITIES", amountCentavos: 100000, dueDate: "2026-11-17", myShareCentavos: 33334 }} />
            </div>
          </FeatureCard>
          <FeatureCard title="Ask Ming" text={'Type "I spent 300 on pizza". Ming fills it in; you confirm before it saves.'}>
            <div className="space-y-3 pt-4">
              <p className="ml-auto w-fit rounded-[20px] rounded-br-md bg-olive px-4 py-2.5 text-[15px] text-white">I spent 300 on pizza</p>
              <div className="flex items-end gap-2">
                <MingBust className="w-10 shrink-0" />
                <div className="rounded-[20px] rounded-bl-md border-2 border-dashed border-olive/35 bg-white px-4 py-3">
                  <p className="text-[11px] font-bold tracking-wide text-olive uppercase">Shared expense</p>
                  <p className="text-[15px] font-bold leading-snug">₱300.00 for pizza, split with Vince and Sydney</p>
                </div>
              </div>
            </div>
          </FeatureCard>
        </div>
      </section>

      <section aria-labelledby="web-title" className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <div className="card-surface grid items-center gap-6 overflow-hidden p-6 sm:p-10 lg:grid-cols-[320px_1fr]">
          <div>
            <h2 id="web-title" className="text-[30px] leading-tight font-extrabold tracking-tight">DormMing on the web, too.</h2>
            <p className="mt-3 text-[17px] text-foreground/70">The same dorm on your laptop: bigger dashboard, the same balances. Changes show up on everyone's phone in seconds.</p>
            <Link to="/signup" className="mt-5 inline-flex h-11 items-center rounded-2xl bg-olive px-5 font-bold text-white">Open DormMing</Link>
          </div>
          <div className="-mr-6 sm:-mr-10"><DesktopDemo /></div>
        </div>
      </section>

      <section id="how" aria-labelledby="how-title" className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 sm:px-8 md:grid-cols-[1fr_380px]">
        <div>
          <h2 id="how-title" className="text-[32px] leading-tight font-extrabold tracking-tight sm:text-[40px]">Set up your dorm in a minute.</h2>
          <p className="mt-3 max-w-[48ch] text-lg text-foreground/70">One person creates the dorm and shares the code. Everyone else scans it, and the balances keep themselves.</p>
        </div>
        <figure className="receipt-paper mx-auto w-full max-w-[380px] px-7 py-9 font-mono text-[14px] text-brown drop-shadow-[0_12px_20px_rgb(36_7_2/0.12)]">
          <p className="text-center text-lg font-extrabold tracking-[0.25em]">DORMMING</p>
          <p className="text-center text-brown/70">HOW IT WORKS</p>
          <div className="my-3 border-t-2 border-dashed border-brown/25" />
          <ol className="space-y-2">
            {["Create or join a dorm", "Add your dorm's gastos", "Settle up and stay square"].map((s, i) => (
              <li key={s} className="flex justify-between gap-4"><span>{s.toUpperCase()}</span><span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span></li>
            ))}
          </ol>
          <div className="my-3 border-t-2 border-dashed border-brown/25" />
          <p className="flex justify-between font-bold"><span>MANUAL MATH</span><span>₱0.00</span></p>
        </figure>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <div className="card-surface flex flex-col items-center gap-4 overflow-hidden px-6 pt-10 text-center">
          <h2 className="text-[30px] font-extrabold tracking-tight">Start your dorm today.</h2>
          <p className="text-foreground/70">Free for every dormmate. Ming is waiting.</p>
          <Link to="/signup" className="flex h-12 items-center rounded-2xl bg-[#1c1b17] px-7 text-[17px] font-bold text-white">Sign up</Link>
          <MingBust className="mt-2 w-[150px]" />
        </div>
      </section>

      <footer className="bg-brown text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-8 md:grid-cols-[1fr_auto_auto]">
          <div>
            <img src="/brand/dormming-logo.png" alt="DormMing" className="h-10 w-auto" />
            <p className="mt-3 max-w-sm text-sm text-white/70">Shared expenses, bills and balances for dormmates. Simulated banking only.</p>
          </div>
          <div className="text-sm"><p className="mb-2 font-semibold text-white/50">Product</p><a href="#features" className="block py-1 text-white/85">Features</a><a href="#how" className="block py-1 text-white/85">How it works</a></div>
          <div className="text-sm"><p className="mb-2 font-semibold text-white/50">Account</p><Link to="/signup" className="block py-1 text-white/85">Sign up</Link><Link to="/login" className="block py-1 text-white/85">Log in</Link></div>
        </div>
        <p className="mx-auto max-w-6xl border-t border-white/10 px-4 py-5 text-xs text-white/55 sm:px-8">© 2026 MING Dynasty · IT 2107 · OOP 101</p>
      </footer>
    </div>
  );
}
