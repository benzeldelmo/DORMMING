import { Link, Navigate } from "react-router-dom";
import { Building2, Check, ChevronDown, HandCoins, House, Receipt, ShieldCheck, ShoppingBag, Users, Wallet } from "lucide-react";
import Ming from "@/components/Ming";
import MingPayDemo from "@/landing/MingPayDemo";
import { isLoggedIn } from "@/lib/auth";
import { cn } from "@/lib/utils";

/** One primary action style everywhere: olive on light ground, white on the olive band. */
const PRIMARY = "inline-flex h-[52px] items-center justify-center rounded-2xl bg-olive px-7 font-heading text-[17px] font-bold text-white shadow-[0_8px_20px_-10px_rgb(36_7_2/0.5)] transition-transform hover:bg-olive/90 active:scale-[0.98]";
const SECONDARY = "inline-flex h-[52px] items-center justify-center rounded-2xl bg-card px-6 font-heading text-[17px] font-bold shadow-[0_8px_20px_-12px_rgb(36_7_2/0.35)] ring-1 ring-border/70 transition-transform active:scale-[0.98]";
const H2 = "font-heading text-[32px] leading-tight font-extrabold tracking-tight text-balance sm:text-[40px]";

/** A word in the hero sentence with its icon, tinted like the app's chips. */
function Chip({ icon: Icon, children }) {
  return (
    <span className="mx-0.5 inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-0.5 align-baseline font-semibold whitespace-nowrap text-olive-ink">
      <Icon aria-hidden className="size-[0.9em]" />{children}
    </span>
  );
}

/** A feature card: a small piece of the real app on top, then what it does. */
function Feature({ title, text, children }) {
  return (
    <li className="flex flex-col rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div aria-hidden className="flex min-h-[176px] items-center justify-center rounded-2xl bg-background px-4 py-6 [&>*]:shadow-none">{children}</div>
      <h3 className="mt-6 font-heading text-[22px] font-extrabold tracking-tight">{title}</h3>
      <p className="mt-2 text-[16px] leading-relaxed text-pretty text-foreground/75">{text}</p>
    </li>
  );
}

const Dot = ({ name, tone }) => (
  <span className={cn("grid size-8 place-items-center rounded-full text-[13px] font-bold text-white ring-2 ring-card", tone)}>{name}</span>
);
const Sharer = ({ children }) => (
  <span className="rounded-full bg-olive px-2 py-0.5 font-sans text-[11px] font-semibold text-white">{children}</span>
);

const FEATURES = [
  {
    title: "Split bills, item by item",
    text: "Type in the receipt and tap who had what. Tax and discounts are shared fairly, and leftover centavos never land on the person who paid.",
    art: (
      <div className="w-full max-w-[260px] rounded-xl bg-[#fffdf6] px-4 py-3 font-mono text-[13px] text-brown">
        <p className="flex justify-between"><span>RICE</span><span>₱200.00</span></p>
        <p className="mt-1 flex gap-1.5"><Sharer>Benzel</Sharer><Sharer>Sydney</Sharer></p>
        <p className="mt-2 flex justify-between"><span>SODA</span><span>₱50.00</span></p>
        <p className="mt-1 flex"><Sharer>Sydney</Sharer></p>
      </div>
    ),
  },
  {
    title: "Add shared expenses",
    text: "One person paid for everyone. Split it equally, or type each person's amount, and everyone's share is worked out for them.",
    art: (
      <div className="flex w-full max-w-[260px] items-center gap-3 rounded-2xl bg-card/70 p-3">
        <span className="grid size-10 place-items-center rounded-xl bg-olive-soft text-olive"><ShoppingBag className="size-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Groceries</span>
          <span className="mt-1 flex -space-x-1.5"><Dot name="B" tone="bg-olive" /><Dot name="V" tone="bg-[#8a6d3b]" /><Dot name="S" tone="bg-[#5b7a8c]" /></span>
        </span>
        <span className="font-heading font-extrabold tabular-nums">₱2,700</span>
      </div>
    ),
  },
  {
    title: "Record payments",
    text: "Paid a dormmate back? Record it and the debt shrinks right away. You can't pay more than you owe.",
    art: (
      <div className="flex w-full max-w-[260px] items-center gap-3 rounded-2xl bg-card/70 p-3">
        <span className="grid size-10 place-items-center rounded-full bg-olive text-white"><Check className="size-5" strokeWidth={3} /></span>
        <span className="min-w-0 flex-1 text-[15px] leading-snug"><b>Benzel</b> paid <b>Vince</b></span>
        <span className="font-heading font-extrabold tabular-nums">₱500</span>
      </div>
    ),
  },
  {
    title: "See who owes whom",
    text: "Debts between two people cancel out, so you only see what's left: who owes you, and whom you owe.",
    art: (
      <div className="grid w-full max-w-[260px] grid-cols-2 gap-2">
        <span className="rounded-2xl bg-olive-soft p-3"><span className="block text-[12px] font-semibold">Owed to you</span><span className="mt-3 block font-heading text-xl font-extrabold tabular-nums">₱1,000</span></span>
        <span className="rounded-2xl bg-orange-soft p-3"><span className="block text-[12px] font-semibold">You owe</span><span className="mt-3 block font-heading text-xl font-extrabold tabular-nums">₱900</span></span>
      </div>
    ),
  },
];

const STEPS = [
  { title: "Create your account", text: "Sign up with your name and email." },
  { title: "Create or join your dorm", text: "Start a dorm and share its 6-character code, or type in the code a dormmate sent you." },
  { title: "Add, split and settle", text: "Record what you spent together, pay each other back, and the balances keep themselves." },
];

const MOODS = [
  { mood: "WORRIED", line: "You owe someone." },
  { mood: "HAPPY", line: "Dormmates owe you." },
  { mood: "CELEBRATING", line: "Everyone's square." },
  { mood: "SLEEPY", line: "Nothing to count yet." },
];

const AUDIENCES = [
  { icon: Users, title: "Roommates", text: "Keep shared groceries, food runs and receipts, and who paid back, in one place." },
  { icon: Building2, title: "Dorm communities", text: "Everyone sees the same records, so nobody keeps the list in the group chat." },
  { icon: House, title: "Boarding house residents", text: "Split rent, utilities and the grocery run with the people you live with." },
];

const FAQ = [
  ["What is DormMing?", "A web app for dormmates and roommates to record shared expenses, split bills, pay each other back and see who owes whom."],
  ["Do I need to join a dorm?", "Yes. DormMing is built around your dorm: after signing up you create one, or join with the 6-character code a dormmate shares."],
  ["How are shared expenses split?", "Equally, by amounts you type for each person, or item by item from a receipt. Amounts are exact to the centavo, and leftover centavos go to the people other than the payer."],
  ["Is this real money?", "No. DormMing only keeps the records. No money moves through the app; you pay each other however you like, then record it."],
  ["Who is Ming?", "Ming is DormMing's cat. His mood follows your balance: worried when you owe someone, celebrating when everyone's square."],
];

export default function Landing() {
  if (isLoggedIn()) return <Navigate to="/home" replace />;
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sm:px-8">
        <Link to="/" aria-label="DormMing home" className="flex h-11 items-center rounded-lg"><img src="/brand/dormming-logo.png" alt="DormMing" width={1446} height={538} className="h-10 w-auto sm:h-11" /></Link>
        <nav className="flex items-center gap-1">
          <a href="#features" className="hidden h-11 items-center rounded-full px-4 text-[15px] font-semibold text-foreground/75 hover:text-foreground md:flex">Features</a>
          <a href="#how" className="hidden h-11 items-center rounded-full px-4 text-[15px] font-semibold text-foreground/75 hover:text-foreground md:flex">How it works</a>
          <a href="#faq" className="hidden h-11 items-center rounded-full px-4 text-[15px] font-semibold text-foreground/75 hover:text-foreground md:flex">FAQ</a>
          <Link to="/login" className="flex h-11 items-center rounded-full px-4 text-[15px] font-semibold hover:bg-card">Log in</Link>
          <Link to="/signup" className="flex h-11 items-center rounded-full bg-olive px-5 text-[15px] font-semibold text-white hover:bg-olive/90">Sign up</Link>
        </nav>
      </header>

      {/* Hero: the promise on the left, the app working on the right */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-8 sm:px-8 lg:grid-cols-[1fr_460px] lg:gap-12 lg:pt-14">
        <div className="order-1 text-center lg:pb-20 lg:text-left">
          <h1 className="font-heading text-[clamp(38px,9.5vw,64px)] leading-[1.05] font-black tracking-[-0.03em] text-balance">
            <span className="sm:block">Your dorm life. </span>
            <span className="sm:block">Your money. <span className="inline-block rounded-full bg-brown px-[0.38em] pb-[0.06em] text-white">In sync.</span></span>
          </h1>
          <p className="mx-auto mt-6 max-w-[46ch] text-lg leading-[1.9] text-foreground/75 sm:text-xl lg:mx-0">
            Split <Chip icon={Receipt}>receipts</Chip> item by item, add <Chip icon={ShoppingBag}>shared expenses</Chip>, record <Chip icon={HandCoins}>payments</Chip>, and see <Chip icon={Wallet}>who owes whom</Chip> with the people you live with.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/signup" className={cn(PRIMARY, "w-full sm:w-auto")}>Create your account</Link>
            <Link to="/login" className={cn(SECONDARY, "w-full sm:w-auto")}>I have an account</Link>
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-foreground/70 lg:justify-start"><ShieldCheck className="size-4" />Free. Just records: no real money moves.</p>
        </div>
        {/* Always last, so the phone's faded foot sits on the hero's bottom edge */}
        <div className="order-2 mx-auto w-full max-w-[460px] self-end">
          <MingPayDemo />
        </div>
      </section>

      <section aria-labelledby="why" className="bg-card">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:py-20">
          <h2 id="why" className={H2}>Living together. Spending smarter.</h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-lg leading-relaxed text-pretty text-foreground/75">Rent, utilities, groceries, the late-night food run: shared costs get messy fast. DormMing keeps every shared expense, every split and every payment in one place your whole dorm can see.</p>
        </div>
      </section>

      <section id="features" aria-labelledby="features-title" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-16 sm:px-8 lg:py-24">
        <h2 id="features-title" className={cn(H2, "text-center")}>Everything your dorm's money needs.</h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14">
          {FEATURES.map((f) => <Feature key={f.title} title={f.title} text={f.text}>{f.art}</Feature>)}
        </ul>
      </section>

      <section id="how" aria-labelledby="how-title" className="scroll-mt-6 bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1fr_380px] lg:py-24">
          <div>
            <h2 id="how-title" className={cn(H2, "text-center md:text-left")}>Getting started is simple.</h2>
            <ol className="mt-8 space-y-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-olive font-heading text-lg font-extrabold text-white tabular-nums">{i + 1}</span>
                  <span>
                    <span className="block font-heading text-[20px] font-extrabold">{s.title}</span>
                    <span className="mt-1 block max-w-[46ch] text-[16px] leading-relaxed text-foreground/75">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="text-center md:text-left"><Link to="/signup" className={cn(PRIMARY, "mt-10")}>Start or join a dorm</Link></div>
          </div>
          <figure aria-hidden className="receipt-paper mx-auto w-full max-w-[380px] px-7 py-9 font-mono text-[14px] text-brown drop-shadow-[0_16px_28px_rgb(36_7_2/0.2)]">
            <p className="text-center font-heading text-lg font-extrabold tracking-[0.25em]">DORMMING</p>
            <p className="text-center text-brown/75">HOW IT WORKS</p>
            <div className="my-3 border-t-2 border-dashed border-brown/25" />
            <ol className="space-y-2">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex justify-between gap-4"><span>{s.title.toUpperCase()}</span><span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span></li>
              ))}
            </ol>
            <div className="my-3 border-t-2 border-dashed border-brown/25" />
            <p className="flex justify-between font-bold"><span>GROUP-CHAT MATH</span><span>₱0.00</span></p>
            <div className="my-3 border-t-2 border-dashed border-brown/25" />
            <p className="text-center text-brown/75">Thank you, dormmates! — Ming</p>
          </figure>
        </div>
      </section>

      <section aria-labelledby="ming-title" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[44ch] text-center">
          <h2 id="ming-title" className={H2}>Meet Ming, your little dorm companion.</h2>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-foreground/75">Ming keeps count with you, and his mood follows your balance. One look tells you where you stand.</p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {MOODS.map(({ mood, line }) => (
            <li key={mood} className="flex flex-col items-center rounded-3xl bg-card px-4 pt-6 pb-5 text-center shadow-[var(--shadow-card)]">
              <Ming mood={mood} className="w-full max-w-[160px]" />
              <p className="mt-3 font-heading text-[17px] font-bold">{line}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="who-title" className="bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
          <h2 id="who-title" className={cn(H2, "text-center")}>Made for the way students live.</h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {AUDIENCES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 md:flex-col">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-olive-soft text-olive"><Icon className="size-6" /></span>
                <span>
                  <span className="block font-heading text-[20px] font-extrabold">{title}</span>
                  <span className="mt-1 block text-[16px] leading-relaxed text-foreground/75">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-3xl scroll-mt-6 px-5 py-16 sm:px-8 lg:py-24">
        <h2 id="faq-title" className={cn(H2, "text-center")}>Frequently asked questions</h2>
        <div className="mt-10 divide-y divide-border rounded-3xl bg-card px-6 shadow-[var(--shadow-card)]">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-heading text-[18px] font-bold">
                {q}<ChevronDown aria-hidden className="size-5 shrink-0 text-foreground/50 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-1 max-w-[60ch] pb-1 text-[16px] leading-relaxed text-foreground/75">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="cta" className="bg-olive text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-5 pt-14 sm:px-8 md:grid-cols-[1fr_320px] md:gap-12 md:pt-16">
          <div className="text-center md:pb-16 md:text-left">
            <h2 id="cta" className={H2}>Make room for smarter finances.</h2>
            <p className="mx-auto mt-3 max-w-[40ch] text-lg leading-relaxed text-pretty text-white md:mx-0">Less confusion, fairer splits, happier dorm living. Ming is waiting for your dorm.</p>
            <Link to="/signup" className="mt-8 inline-flex h-[52px] items-center justify-center rounded-2xl bg-white px-7 font-heading text-[17px] font-bold text-olive transition-transform focus-visible:outline-white active:scale-[0.98]">Create your account</Link>
          </div>
          {/* Full-body Ming stands on the band's bottom edge, so his feet meet the footer line. */}
          <Ming mood="CELEBRATING" className="mx-auto w-[220px] self-end md:w-full" />
        </div>
      </section>

      <footer className="bg-olive text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 border-t border-white/20 px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-sm sm:px-8 md:flex-row md:justify-between md:text-left">
          <p><span className="font-bold">DormMing</span> · Your dorm life. Your money. In sync.</p>
          <nav aria-label="Footer" className="flex gap-1">
            <a href="#features" className="flex h-11 items-center rounded-lg px-3 hover:bg-white/10 focus-visible:outline-white">Features</a>
            <a href="#how" className="flex h-11 items-center rounded-lg px-3 hover:bg-white/10 focus-visible:outline-white">How it works</a>
            <a href="#faq" className="flex h-11 items-center rounded-lg px-3 hover:bg-white/10 focus-visible:outline-white">FAQ</a>
          </nav>
          <p>© 2026 DormMing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
