import { Link, Navigate } from "react-router-dom";
import { ArrowLeftRight, BellRing, Bot, ChartPie, CreditCard, History, QrCode, ReceiptText, ShieldCheck, Smile, Split, UserRound, Users } from "lucide-react";
import HeroDemo from "@/landing/HeroDemo";
import Ming from "@/components/Ming";
import { isLoggedIn } from "@/lib/auth";

const GROUPS = [
  {
    title: "Split",
    line: "Exact to the centavo, every time.",
    items: [
      { icon: Split, name: "Shared expenses", text: "Split equally or by custom amounts." },
      { icon: ReceiptText, name: "Thermal receipt", text: "Itemize who had what; tax and tips shared fairly." },
      { icon: ChartPie, name: "Dorm spending", text: "What the dorm spent this month, by category." },
    ],
  },
  {
    title: "Track",
    line: "Know what's due before it's late.",
    items: [
      { icon: BellRing, name: "Bills and reminders", text: "Due dates, weekly or monthly repeats, your share." },
      { icon: History, name: "Activity history", text: "Every expense, bill and payment in one feed." },
      { icon: Users, name: "Dorms", text: "Create one, or join with a code or QR." },
    ],
  },
  {
    title: "Settle",
    line: "Who owes whom, without the math.",
    items: [
      { icon: ArrowLeftRight, name: "Payment tracking", text: "Partial payments count; debts net out between two people." },
      { icon: CreditCard, name: "Digital card", text: "A simulated card that flips to your friend QR." },
      { icon: QrCode, name: "Friends", text: "Scan a card to connect, then invite them in." },
    ],
  },
  {
    title: "Ming",
    line: "A dormmate who never forgets.",
    items: [
      { icon: Smile, name: "Moods", text: "Happy, worried, celebrating or napping, drawn for each." },
      { icon: Bot, name: "AI assistant", text: "Type \"I spent 150 on rice\". Ming fills it in; you confirm." },
      { icon: UserRound, name: "Always there", text: "Ming greets you on Home and reacts to your balance." },
    ],
  },
];

const STEPS = ["Create or join a dorm", "Add expenses and bills", "Settle up and stay square"];

export default function Landing() {
  if (isLoggedIn()) return <Navigate to="/home" replace />;
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <img src="/brand/dormming-logo.png" alt="DormMing" className="h-10 w-auto sm:h-12" />
        <nav className="flex items-center gap-2">
          <Link to="/login" className="rounded-full px-4 py-2 text-[15px] font-semibold hover:bg-card">Log in</Link>
          <Link to="/signup" className="rounded-full bg-olive px-4 py-2 text-[15px] font-semibold text-white hover:bg-olive/90">Sign up</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-10 pb-20 sm:px-8 lg:grid-cols-[1fr_440px] lg:gap-16 lg:pt-16 lg:pb-28">
        <div className="max-w-xl">
          <h1 className="font-heading text-[46px] leading-[1.02] font-black tracking-[-0.025em] text-balance sm:text-[68px]">
            Dorm money, minus the <span className="sticker-text">drama.</span>
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-foreground/75 sm:text-xl">
            Split groceries, track bills and see who owes whom, with Ming, your dorm's cat companion, keeping count. No group chat math.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/signup" className="flex h-[52px] items-center rounded-2xl bg-olive px-7 font-heading text-[17px] font-bold text-white shadow-[0_8px_20px_-10px_rgb(36_7_2/0.5)] transition-transform active:scale-[0.98]">Get started, it's free</Link>
            <Link to="/login" className="flex h-[52px] items-center rounded-2xl bg-card px-6 font-heading text-[17px] font-bold shadow-[var(--shadow-card)]">I have an account</Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-foreground/60"><ShieldCheck className="size-4" />Simulated banking only. No real money moves.</p>
        </div>
        <div className="mx-auto w-full max-w-[440px]">
          <HeroDemo />
        </div>
      </section>

      <section aria-labelledby="features" className="bg-card">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <h2 id="features" className="max-w-2xl font-heading text-[32px] leading-tight font-extrabold tracking-tight sm:text-[40px]">Everything a shared room spends on, in one place.</h2>
          <div className="mt-12 divide-y divide-border border-y border-border">
            {GROUPS.map((g) => (
              <div key={g.title} className="grid gap-6 py-10 md:grid-cols-[240px_1fr] md:gap-10">
                <div>
                  <h3 className="font-heading text-2xl font-extrabold text-olive">{g.title}</h3>
                  <p className="mt-1 text-foreground/65">{g.line}</p>
                </div>
                <ul className="grid gap-6 sm:grid-cols-3 sm:gap-8">
                  {g.items.map(({ icon: Icon, name, text }) => (
                    <li key={name} className="flex gap-3">
                      <Icon className="mt-0.5 size-5 shrink-0 text-orange" />
                      <span>
                        <span className="block font-heading text-[17px] font-bold">{name}</span>
                        <span className="mt-1 block text-[15px] leading-relaxed text-foreground/65">{text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="how" className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1fr_380px] lg:py-28">
        <div>
          <h2 id="how" className="font-heading text-[32px] leading-tight font-extrabold tracking-tight sm:text-[40px]">Set up your dorm in a minute.</h2>
          <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-foreground/70">One person creates the dorm and shares the code. Everyone else scans it, and the balances start keeping themselves.</p>
          <Link to="/signup" className="mt-8 inline-flex h-[52px] items-center rounded-2xl bg-orange px-7 font-heading text-[17px] font-bold text-white">Create your dorm</Link>
        </div>
        <figure className="receipt-paper mx-auto w-full max-w-[380px] px-7 py-9 font-mono text-[14px] text-brown drop-shadow-[0_12px_20px_rgb(36_7_2/0.12)]">
          <p className="text-center font-heading text-lg font-extrabold tracking-[0.25em]">DORMMING</p>
          <p className="text-center text-brown/70">HOW IT WORKS</p>
          <div className="my-3 border-t-2 border-dashed border-brown/25" />
          <ol className="space-y-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex justify-between gap-4"><span>{s.toUpperCase()}</span><span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span></li>
            ))}
          </ol>
          <div className="my-3 border-t-2 border-dashed border-brown/25" />
          <p className="flex justify-between font-bold"><span>MANUAL MATH</span><span>₱0.00</span></p>
          <div className="my-3 border-t-2 border-dashed border-brown/25" />
          <p className="text-center text-brown/70">Thank you, dormmates! — Ming</p>
        </figure>
      </section>

      <footer className="bg-olive text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-12 sm:flex-row sm:items-center sm:px-8">
          <Ming mood="CELEBRATING" className="size-24 shrink-0" />
          <div className="flex-1">
            <p className="font-heading text-xl font-bold">Ming is waiting for your dorm.</p>
            <p className="text-sm text-white/75">© 2026 MING Dynasty · IT 2107 · OOP 101. Simulated banking only. <Link to="/terms" className="underline underline-offset-2">Terms</Link> · <Link to="/privacy" className="underline underline-offset-2">Privacy</Link></p>
          </div>
          <Link to="/signup" className="rounded-2xl bg-sun px-6 py-3 font-heading font-bold text-brown">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
